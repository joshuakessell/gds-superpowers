"""Run with python3 -B -m unittest discover -s tests -p test_chatgpt_export.py."""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock
import zipfile

ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('gds_export', ROOT/'scripts/export-chatgpt.py')
exporter=importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)

class ExportTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='gds-chatgpt-export-')
        self.addCleanup(self.temp.cleanup)
        self.work=Path(self.temp.name)

    def test_skill_layout_and_exact_snapshot(self):
        output=self.work/'skill.zip'
        result=exporter.export_package(ROOT,output)
        with zipfile.ZipFile(output) as z:
            self.assertIsNone(z.testzip())
            self.assertEqual({x.split('/')[0] for x in z.namelist()},{'gds-superpowers'})
            self.assertEqual(z.read('gds-superpowers/SKILL.md'),(ROOT/'SKILL.md').read_bytes())
            self.assertEqual(z.read('gds-superpowers/references/chatgpt.md'),(ROOT/'references/chatgpt.md').read_bytes())
            self.assertFalse(any('/.git/' in p or '/historical/' in p for p in z.namelist()))
            self.assertEqual(json.loads(z.comment)['source_manifest_sha256'],result['source_manifest_sha256'])
            z.extractall(self.work/'extracted')
        check=subprocess.run(['node','scripts/check-package.mjs'],cwd=self.work/'extracted/gds-superpowers',capture_output=True,text=True)
        self.assertEqual(check.returncode,0,check.stdout+check.stderr)

    def test_portable_plugin_declares_only_one_top_level_skill_and_no_servers(self):
        output=self.work/'plugin.zip'
        exporter.export_package(ROOT,output,'plugin')
        with zipfile.ZipFile(output) as z:
            manifest=json.loads(z.read('plugin.json'))
            self.assertEqual(manifest['name'],'gds-superpowers')
            self.assertIn('$schema',manifest)
            self.assertNotIn('mcpServers',manifest)
            self.assertNotIn('hooks',manifest)
            entries=[p for p in z.namelist() if len(p.split('/'))==3 and p.startswith('skills/') and p.endswith('/SKILL.md')]
            self.assertEqual(entries,['skills/gds-superpowers/SKILL.md'])

    def test_repeated_exports_are_byte_identical(self):
        a,b=self.work/'a.zip',self.work/'b.zip'
        exporter.export_package(ROOT,a)
        exporter.export_package(ROOT,b)
        self.assertEqual(a.read_bytes(),b.read_bytes())

    def test_existing_output_is_not_overwritten(self):
        output=self.work/'protected.zip';output.write_bytes(b'preserve this')
        with self.assertRaises(FileExistsError):exporter.export_package(ROOT,output)
        self.assertEqual(output.read_bytes(),b'preserve this')

    def test_output_inside_source_is_rejected_before_writes(self):
        target=ROOT/'must-not-create-export.zip'
        with self.assertRaisesRegex(ValueError,'outside'):exporter.export_package(ROOT,target)
        self.assertFalse(target.exists())

    def test_source_symlink_is_rejected(self):
        link=self.work/'linked-source';link.symlink_to(ROOT,target_is_directory=True)
        with self.assertRaisesRegex(ValueError,'symlink'):exporter.export_package(link,self.work/'out.zip')

    def test_bad_format_is_rejected_without_creating_output(self):
        output=self.work/'out.zip'
        with self.assertRaises(ValueError):exporter.export_package(ROOT,output,'pretend')
        self.assertFalse(output.exists())

    def test_changed_source_is_not_reblessed_or_packaged(self):
        files,_=exporter.snapshot(ROOT);copy=self.work/'source'
        for name,data in files.items():
            dest=copy/name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
        with (copy/'SKILL.md').open('ab') as f:f.write(b'\nUnexpected mutation\n')
        output=self.work/'out.zip'
        with self.assertRaises(subprocess.CalledProcessError):exporter.export_package(copy,output)
        self.assertFalse(output.exists())

    def test_nonzero_verifier_preserves_the_file_diagnostic_in_cli(self):
        error=subprocess.CalledProcessError(1,['node','scripts/manifest.mjs'],stderr='Checksum mismatch: SKILL.md')
        with mock.patch.object(exporter,'export_package',side_effect=error), mock.patch('sys.argv',['export-chatgpt.py','--output',str(self.work/'out.zip')]), mock.patch('sys.stderr') as stderr:
            self.assertEqual(exporter.main(),1)
        self.assertIn('Checksum mismatch: SKILL.md',''.join(str(call.args[0]) for call in stderr.write.call_args_list))

    def test_plugin_missing_version_refuses_before_creating_archive(self):
        files,digest=exporter.snapshot(ROOT);del files['VERSION'];output=self.work/'out.zip'
        with mock.patch.object(exporter,'snapshot',return_value=(files,digest)):
            with self.assertRaisesRegex(ValueError,'VERSION is required'):exporter.export_package(ROOT,output,'plugin')
        self.assertFalse(output.exists())

    def test_failed_zip_write_removes_its_partial_archive(self):
        output=self.work/'partial.zip'
        with mock.patch.object(zipfile.ZipFile,'writestr',side_effect=OSError('Simulated write failure')):
            with self.assertRaisesRegex(OSError,'Simulated'):exporter.export_package(ROOT,output)
        self.assertFalse(output.exists())

    def test_failed_zip_verification_removes_its_archive(self):
        output=self.work/'invalid.zip'
        with mock.patch.object(zipfile.ZipFile,'testzip',return_value='bad-member'):
            with self.assertRaisesRegex(ValueError,'integrity'):exporter.export_package(ROOT,output)
        self.assertFalse(output.exists())

    def test_exclusive_create_race_does_not_remove_an_unrelated_archive(self):
        output=self.work/'raced.zip';files,digest=exporter.snapshot(ROOT)
        def concurrent_snapshot(_):
            output.write_bytes(b'unrelated concurrent output')
            return files,digest
        with mock.patch.object(exporter,'snapshot',side_effect=concurrent_snapshot):
            with self.assertRaises(FileExistsError):exporter.export_package(ROOT,output)
        self.assertEqual(output.read_bytes(),b'unrelated concurrent output')

if __name__=='__main__':unittest.main()
