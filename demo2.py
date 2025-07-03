#!/usr/bin/env python3
"""
Grab up to 1-year of daily usage buckets from every available endpoint.
Writes raw lines to usage_dump.jsonl and prints a nested summary:
endpoint → date → metric → total.
"""

import time, json, requests, collections, datetime as dt, pathlib

API_KEY = "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"
PROJECT_ID = ""                                 # or "proj_abc123"
DAYS_BACK  = 365
OUT_FILE   = pathlib.Path("usage_dump.jsonl")


ENDPOINTS = [
    "completions", "embeddings", "images", "moderations",
    "audio_transcriptions", "audio_speeches",
    "code_interpreter_sessions", "vector_stores",
]

BASE  = "https://api.openai.com/v1/organization/usage"
HEAD  = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
DAY   = 24 * 3600

def fetch_slice(ep: str, start: int, end: int, page=None):
    """Return one page of usage buckets for an endpoint."""
    url = f"{BASE}/{ep}"
    # core params every endpoint accepts
    params = {
        "start_time": start,
        "end_time":   end,
        "limit":      31,
    }
    if page:
        params["page"] = page
    if PROJECT_ID:
        params["project_ids"] = [PROJECT_ID]

    # the “LM” endpoints allow finer controls
    if ep in {"completions", "embeddings", "images", "moderations"}:
        params.update({
            "bucket_width": "1d",
            "group_by": ["model"],
        })

    r = requests.get(url, headers=HEAD, params=params, timeout=30)
    if r.status_code == 404:          # feature not enabled in this org
        raise FileNotFoundError(ep)
    if r.status_code == 400 and "group_by" in params:
        # graceful fallback: retry without the fancy params once
        params.pop("group_by")
        params.pop("bucket_width", None)
        r = requests.get(url, headers=HEAD, params=params, timeout=30)

    r.raise_for_status()
    return r.json()

def all_buckets(ep):
    now, stop = int(time.time()), int(time.time()) - DAYS_BACK * DAY
    end = now
    while end > stop:
        start = max(end - 31 * DAY, stop)
        page = None
        while True:
            data = fetch_slice(ep, start, end, page)
            yield from data["data"]
            page = data.get("next_page")
            if not page:
                break
        end = start

def write_raw(ep):
    with OUT_FILE.open("a") as f:
        for b in all_buckets(ep):
            f.write(json.dumps({"endpoint": ep, **b}) + "\n")

def rollup():
    daily = collections.defaultdict(lambda: collections.defaultdict(collections.Counter))
    with OUT_FILE.open() as f:
        for line in f:
            rec  = json.loads(line)
            ep   = rec["endpoint"]
            date = dt.datetime.utcfromtimestamp(rec["start_time"]).strftime("%Y-%m-%d")
            for row in rec["results"]:
                for k, v in row.items():
                    if isinstance(v, (int, float)):
                        daily[ep][date][k] += v
    return daily

if __name__ == "__main__":
    if OUT_FILE.exists(): OUT_FILE.unlink()
    for ep in ENDPOINTS:
        try:
            print(f"⏳  collecting {ep} …")
            write_raw(ep)
        except FileNotFoundError:
            print(f"⚠️   {ep} endpoint not available for this org – skipped.")
    print("\n=== summary ===")
    print(json.dumps(rollup(), indent=2))