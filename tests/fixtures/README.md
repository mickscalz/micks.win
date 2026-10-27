# Codec regression fixtures

Two original, generated sine waves (no third-party recording): 2.5 seconds at
16 kHz, MP3 440 Hz / FLAC 220 Hz. Used to exercise real browser-native decoding
and the existing worker, not just mocks. Generated with FFmpeg's `sine` source,
`libmp3lame -b:a 32k` / `flac`, with metadata removed. No user audio is included.

Added Ogg Vorbis 330 Hz, 2.5 seconds at 44.1 kHz, FFmpeg `sine`,
`libvorbis -q:a 2 -map_metadata -1`, for the interruptible decoder/resampler.
