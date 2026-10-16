"""Run with python3 -B -m unittest discover -s tests -p test_chatgpt_export.py."""
from __future__ import annotations
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
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

if __name__=='__main__':unittest.main()
