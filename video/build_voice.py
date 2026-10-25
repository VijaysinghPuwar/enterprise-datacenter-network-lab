#!/usr/bin/env python3
"""Generate the DC1 walkthrough narration with Microsoft Edge TTS (Andrew Multilingual).

Reads narration.json (same folder) and writes, for every scene:
  voice/<id>.mp3          narration audio
  voice/<id>.words.json   word-level timings (seconds) used to sync visuals and captions

Run once on a machine that can reach Microsoft's TTS service:
  python3 -m venv .venv && .venv/bin/pip install -q edge-tts && .venv/bin/python build_voice.py
"""
import asyncio
import json
import pathlib
import sys

import edge_tts

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "voice"


async def synth(scene, voice, rate):
    mp3 = OUT / f"{scene['id']}.mp3"
    words_path = OUT / f"{scene['id']}.words.json"
    words = []
    for attempt in range(1, 4):
        try:
            words = []
            comm = edge_tts.Communicate(scene["text"], voice, rate=rate, boundary="WordBoundary")
            with open(mp3, "wb") as f:
                async for chunk in comm.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                        words.append({
                            "start": round(chunk["offset"] / 1e7, 3),
                            "end": round((chunk["offset"] + chunk["duration"]) / 1e7, 3),
                            "text": chunk["text"],
                        })
            if mp3.stat().st_size > 1000 and words:
                break
        except Exception as exc:  # network hiccup: retry
            print(f"  {scene['id']} attempt {attempt} failed: {exc}", file=sys.stderr)
            await asyncio.sleep(2 * attempt)
    else:
        raise SystemExit(f"Could not synthesize {scene['id']}")
    words_path.write_text(json.dumps(words, indent=1))
    print(f"  {scene['id']}: {mp3.stat().st_size // 1024} KB, {len(words)} words, ends at {words[-1]['end']:.1f}s")


async def main():
    cfg = json.loads((HERE / "narration.json").read_text())
    OUT.mkdir(exist_ok=True)
    print(f"Voice: {cfg['voice']}  rate: {cfg['rate']}")
    for scene in cfg["scenes"]:
        await synth(scene, cfg["voice"], cfg["rate"])
    (OUT / "DONE.txt").write_text("ok\n")
    print("All scenes done ->", OUT)


if __name__ == "__main__":
    asyncio.run(main())
