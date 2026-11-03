#!/usr/bin/env python3
"""Four-byte-align uncompressed APK entries, equivalent to zipalign -p 4.

The project has no native .so libraries, so page alignment is not required.
Run this before APK signing; modifying a signed APK invalidates its signature.
"""
import copy
import struct
import sys
import zipfile

source, destination = sys.argv[1:3]
with zipfile.ZipFile(source, 'r') as original, zipfile.ZipFile(destination, 'w') as aligned:
    for entry in original.infolist():
        info = copy.copy(entry)
        info.extra = b''
        if info.compress_type == zipfile.ZIP_STORED:
            filename, _ = info._encodeFilenameFlags()
            # Include an extra-field header and pad its payload to align file data.
            padding = (-(aligned.fp.tell() + 30 + len(filename) + 4)) % 4
            info.extra = struct.pack('<HH', 0xD935, padding) + bytes(padding)
        aligned.writestr(info, original.read(entry.filename))

with zipfile.ZipFile(destination) as apk, open(destination, 'rb') as raw:
    for entry in apk.infolist():
        if entry.compress_type == zipfile.ZIP_STORED:
            raw.seek(entry.header_offset)
            header = raw.read(30)
            filename_length, extra_length = struct.unpack_from('<HH', header, 26)
            offset = entry.header_offset + 30 + filename_length + extra_length
            if offset % 4:
                raise SystemExit(f'Unaligned APK entry: {entry.filename}')
