#!/usr/bin/env python3
"""Export a verified source snapshot, without installing a skill or invoking models."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import sys
import zipfile

NAME = "gds-superpowers"
MAX_BYTES = 64 * 1024 * 1024


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def snapshot(source: Path) -> tuple[dict[str, bytes], str]:
    """Validate with the canonical verifier, then hash the exact exported bytes."""
    if source.is_symlink():
        raise ValueError("Selected source root must not be a symlink")
    root = source.resolve(strict=True)
    if not root.is_dir():
        raise ValueError("Source must be an existing directory")
    checked = subprocess.run(
        ["node", str(root / "scripts/manifest.mjs")], cwd=root,
        check=True, capture_output=True, text=True, timeout=30,
    )
    if json.loads(checked.stdout).get("profile") != "source":
        raise ValueError("Export from verified repository source, not an installed runtime")
    manifest = (root / "MANIFEST.sha256").read_bytes()
    files: dict[str, bytes] = {"MANIFEST.sha256": manifest}
    total = len(manifest)
    for row in manifest.decode("utf-8").splitlines():
        match = re.fullmatch(r"([0-9a-f]{64})  (.+)", row)
        if match is None:
            raise ValueError("Malformed source manifest")
        digest, name = match.groups()
        parts = name.split("/")
        if (name in files or PurePosixPath(name).is_absolute()
                or any(p in ("", ".", "..") for p in parts)
                or "\\" in name or ":" in name):
            raise ValueError("Unsafe or duplicate manifested path")
        file = root
        for part in parts:
            file = file / part
            if file.is_symlink():
                raise ValueError(f"Source symlink refused: {name}")
        if not file.is_file() or file.stat().st_size > MAX_BYTES:
            raise ValueError(f"Not a bounded regular source file: {name}")
        data = file.read_bytes()
        if sha256(data) != digest:
            raise ValueError(f"Source changed after verification: {name}")
        total += len(data)
        if total > MAX_BYTES:
            raise ValueError("Export exceeds the 64 MiB uncompressed safety limit")
        files[name] = data
    entry = files.get("SKILL.md", b"").decode("utf-8")
    if not re.match(r"\A---\r?\n", entry) or not re.search(
            rf"^name: {NAME}\r?$", entry.split("---", 2)[1], re.M):
        raise ValueError("Canonical SKILL.md frontmatter is missing")
    if (root / "MANIFEST.sha256").read_bytes() != manifest:
        raise ValueError("Source manifest changed during export")
    return files, sha256(manifest)


def export_package(source: Path, output: Path, package_format: str = "skill") -> dict:
    if package_format not in ("skill", "plugin"):
        raise ValueError("Choose skill or plugin format")
    if source.is_symlink():
        raise ValueError("Selected source root must not be a symlink")
    root = source.resolve(strict=True)
    destination = output.absolute()
    if destination.suffix.lower() != ".zip":
        raise ValueError("Output must have a .zip extension")
    # The output must not become an unexpected file in the verified source tree.
    parent = destination.parent.resolve(strict=True)
    destination = parent / destination.name
    if destination == root or root in destination.parents:
        raise ValueError("Write the archive outside the source directory")
    if destination.exists() or destination.is_symlink():
        raise FileExistsError("Output exists; choose a new archive name")
    files, digest = snapshot(root)
    prefix = f"{NAME}/" if package_format == "skill" else f"skills/{NAME}/"
    members = {prefix + name: data for name, data in files.items()}
    if package_format == "plugin":
        version_bytes = files.get("VERSION")
        if version_bytes is None:
            raise ValueError("VERSION is required for plugin export")
        version = version_bytes.decode("utf-8").strip()
        if not re.fullmatch(r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?", version):
            raise ValueError("VERSION must be a semantic version")
        manifest = {
            "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
            "name": NAME, "version": version,
            "description": "Guided solo game design and bounded implementation with available tools.",
            "repository": "https://github.com/joshuakessell/gds-superpowers",
        }
        members["plugin.json"] = (json.dumps(manifest, indent=2) + "\n").encode()
    receipt = {"format": package_format, "skill": NAME,
               "source_manifest_sha256": digest, "files": len(members)}
    # Clean up only the file this invocation created; preserve preexisting/replaced files.
    created_identity = None
    try:
        with destination.open("xb") as stream:
            created = os.fstat(stream.fileno())
            created_identity = (created.st_dev, created.st_ino)
            with zipfile.ZipFile(stream, mode="w", compression=zipfile.ZIP_DEFLATED,
                                 compresslevel=9) as archive:
                archive.comment = json.dumps(receipt, sort_keys=True).encode("utf-8")
                for name, data in sorted(members.items()):
                    info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
                    info.create_system = 3
                    info.external_attr = (stat.S_IFREG | 0o644) << 16
                    info.compress_type = zipfile.ZIP_DEFLATED
                    archive.writestr(info, data, compresslevel=9)
        with zipfile.ZipFile(destination) as archive:
            if archive.testzip() is not None:
                raise ValueError("Archive integrity check failed; output is not ready to upload")
        archive_digest = sha256(destination.read_bytes())
    except Exception:
        if created_identity is not None:
            try:
                current = destination.lstat()
                if stat.S_ISREG(current.st_mode) and (current.st_dev, current.st_ino) == created_identity:
                    destination.unlink()
            except OSError:
                pass  # Preserve the original failure when cleanup is not permitted.
        raise
    return {**receipt, "output": str(destination), "archive_sha256": archive_digest}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--format", choices=("skill", "plugin"), default="skill")
    args = parser.parse_args()
    try:
        result = export_package(Path(__file__).resolve().parent.parent, args.output, args.format)
    except subprocess.CalledProcessError as error:
        detail = (error.stderr or error.stdout or str(error)).strip()
        print(f"Export refused: source verification failed: {detail}", file=sys.stderr)
        return 1
    except (ValueError, OSError, UnicodeError, subprocess.SubprocessError, zipfile.BadZipFile) as error:
        # This exporter never sends network requests or reads provider credentials.
        print(f"Export refused: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, indent=2))
    print("Archive created only. Upload, scanning, installation and live-host testing remain separate.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
