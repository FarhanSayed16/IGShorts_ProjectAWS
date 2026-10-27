#!/usr/bin/env python3
"""Bootstrap an IGshorts creator index from published/licensed datasets and local seed lists.

This script does NOT scrape Instagram, bypass access controls, enumerate handles,
use login cookies, or attempt to collect private information. It imports FastSocial's
published dataset (CC BY 4.0) and merges the existing IGshorts India/Global seed CSVs.

Usage:
  python IGshorts_data_bootstrap.py --seed-dir . --out-dir ./igshorts_bootstrap
  python IGshorts_data_bootstrap.py --seed-dir . --out-dir ./igshorts_bootstrap --skip-download

Internet is required to download FastSocial's latest CSV. If the download fails, local
seed files are still processed. Counts from older IGshorts seed lists are approximations
and must not be presented as live readings.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError

FASTSOCIAL_LATEST_URL = "https://raw.githubusercontent.com/FastSocialCo/instagram-top-accounts/main/data/latest.csv"
FASTSOCIAL_MANIFEST_URL = "https://raw.githubusercontent.com/FastSocialCo/instagram-top-accounts/main/data/manifest.json"
FASTSOCIAL_REPO_URL = "https://github.com/FastSocialCo/instagram-top-accounts"
FASTSOCIAL_LICENSE = "CC BY 4.0; attribute FastSocial Top Charts and link to repository"
DEFAULT_SEED_FILES = ("IGshorts_India_200_Seed_List.csv", "IGshorts_Global_200_Seed_List.csv")


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def normalize_username(value: object) -> str:
    """Normalize an Instagram handle or profile URL for exact matching."""
    text = str(value or "").strip()
    text = re.sub(r"^https?://(www\.)?instagram\.com/", "", text, flags=re.I)
    text = text.split("?", 1)[0].split("#", 1)[0].strip(" /\t\r\n")
    text = text.lstrip("@").strip().lower()
    # Don't allow URLs or path segments to become usernames.
    if not text or "/" in text or any(ch.isspace() for ch in text):
        return ""
    return text


def profile_url(username: str) -> str:
    return f"https://www.instagram.com/{username}/" if username else ""


def audience_group(followers: int | None) -> str:
    if followers is None or followers < 0:
        return "Not measured yet"
    if followers < 10_000:
        return "Not grouped yet"
    if followers < 100_000:
        return "Community"
    if followers < 1_000_000:
        return "Established"
    if followers < 10_000_000:
        return "Public"
    return "Major"


def to_int(value: object) -> int | None:
    if value is None:
        return None
    text = str(value).strip().replace(",", "")
    if not text:
        return None
    try:
        number = float(text)
        if number < 0:
            return None
        return int(number)
    except (ValueError, TypeError):
        return None


def download(url: str, target: Path, timeout: int = 40) -> bool:
    request = urllib.request.Request(url, headers={"User-Agent": "IGshorts-data-bootstrap/1.1"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            target.write_bytes(response.read())
        return True
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        print(f"WARNING: could not download {url}: {exc}", file=sys.stderr)
        return False


def read_fastsocial(path: Path) -> list[dict]:
    records: list[dict] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            username = normalize_username(row.get("username"))
            if not username:
                continue
            count = to_int(row.get("followers"))
            observed_date = (row.get("date") or "").strip()
            records.append({
                "username": username,
                "display_name": (row.get("name") or "").strip(),
                "profile_url": profile_url(username),
                "followers_count": count,
                "followers_count_precision": "reported_integer" if count is not None else "unknown",
                "followers_observed_date": observed_date,
                "audience_group": audience_group(count),
                "country_code": (row.get("country") or "").strip(),
                "country_or_region_raw": (row.get("countries") or "").strip(),
                "country_semantics": "source-defined association/citizenship; not necessarily residence or audience location",
                "account_type": (row.get("type") or "").strip(),
                "category": (row.get("category") or "").strip(),
                "source_rank": (row.get("rank") or "").strip(),
                "verified_status": "unknown",
                "data_source": "FastSocial Top Charts",
                "source_url": FASTSOCIAL_REPO_URL,
                "source_license": FASTSOCIAL_LICENSE,
                "data_quality_status": "published dataset; validate currentness and mapping before production",
                "source_count_values": f"FastSocial:{count}" if count is not None else "",
            })
    return records


def read_igshorts_seed(path: Path) -> list[dict]:
    records: list[dict] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            username = normalize_username(row.get("username") or row.get("profile_url"))
            if not username:
                continue
            raw_millions = (row.get("follower_count_millions") or "").strip()
            count = None
            if raw_millions:
                try:
                    parsed = float(raw_millions.replace(",", ""))
                    if parsed >= 0:
                        count = round(parsed * 1_000_000)
                except (ValueError, TypeError):
                    count = None
            source_url = (row.get("ranking_source_url") or "").strip()
            source_name = "IGshorts prior seed list"
            if source_url:
                host = re.sub(r"^https?://(www\.)?", "", source_url, flags=re.I).split("/", 1)[0]
                source_name = f"IGshorts seed from {host}"
            records.append({
                "username": username,
                "display_name": (row.get("account_name") or "").strip(),
                "profile_url": (row.get("profile_url") or profile_url(username)).strip(),
                "followers_count": count,
                "followers_count_precision": "rounded_millions_approximation" if count is not None else "unknown",
                "followers_observed_date": (row.get("verification_date") or "").strip(),
                "audience_group": audience_group(count),
                "country_code": "",
                "country_or_region_raw": (row.get("country_region") or "").strip(),
                "country_semantics": "seed list's region is not necessarily account residence or audience location",
                "account_type": "",
                "category": (row.get("account_category") or "").strip(),
                "source_rank": (row.get("rank") or "").strip(),
                "verified_status": "unknown",
                "data_source": source_name,
                "source_url": source_url,
                "source_license": "Check the source's current terms before public/commercial reuse",
                "data_quality_status": "provisional IGshorts seed; rounded count needs revalidation before public display",
                "source_count_values": f"IGshorts_seed:{count}" if count is not None else "",
            })
    return records


def choose_preferred(rows: list[dict]) -> dict:
    """Prefer exact reported counts over legacy rounded estimates; retain provenance of all rows."""
    def score(record: dict) -> tuple[int, str]:
        precision = 2 if record.get("data_source") == "FastSocial Top Charts" and record.get("followers_count") is not None else (
            1 if record.get("followers_count") is not None else 0
        )
        return precision, str(record.get("followers_observed_date") or "")

    chosen = sorted(rows, key=score, reverse=True)[0].copy()
    counts: list[str] = []
    sources: list[str] = []
    source_urls: list[str] = []
    for record in rows:
        if record.get("source_count_values"):
            counts.append(record["source_count_values"])
        if record.get("data_source") and record["data_source"] not in sources:
            sources.append(record["data_source"])
        if record.get("source_url") and record["source_url"] not in source_urls:
            source_urls.append(record["source_url"])
        for field in ("display_name", "category", "country_code", "country_or_region_raw", "source_rank"):
            if not chosen.get(field) and record.get(field):
                chosen[field] = record[field]
    chosen["source_count_values"] = "; ".join(sorted(set(counts)))
    chosen["all_sources"] = "; ".join(sources)
    chosen["all_source_urls"] = "; ".join(source_urls)
    chosen["source_records_merged"] = len(rows)
    if len(set(counts)) > 1:
        chosen["data_quality_status"] += "; counts differ across sources; see source_count_values"
    return chosen


def merge_records(records: list[dict]) -> list[dict]:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for record in records:
        grouped[record["username"]].append(record)
    merged = [choose_preferred(rows) for rows in grouped.values()]
    return sorted(merged, key=lambda row: (row["followers_count"] is None, -(row["followers_count"] or 0), row["username"]))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed-dir", type=Path, default=Path.cwd(), help="Folder containing the two existing IGshorts seed CSV files")
    parser.add_argument("--out-dir", type=Path, default=Path("./igshorts_bootstrap"), help="Output folder")
    parser.add_argument("--skip-download", action="store_true", help="Use only local seed files; do not fetch FastSocial")
    args = parser.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)
    downloads_dir = args.out_dir / "source_downloads"
    downloads_dir.mkdir(parents=True, exist_ok=True)
    all_records: list[dict] = []
    source_summary: list[dict] = []

    if not args.skip_download:
        fastsocial_path = downloads_dir / "fastsocial_latest.csv"
        if download(FASTSOCIAL_LATEST_URL, fastsocial_path):
            try:
                fastsocial_records = read_fastsocial(fastsocial_path)
                all_records.extend(fastsocial_records)
                source_summary.append({
                    "source": "FastSocial Top Charts",
                    "url": FASTSOCIAL_REPO_URL,
                    "download_url": FASTSOCIAL_LATEST_URL,
                    "license": FASTSOCIAL_LICENSE,
                    "loaded_records": len(fastsocial_records),
                    "snapshot_dates": sorted({r["followers_observed_date"] for r in fastsocial_records if r["followers_observed_date"]}),
                    "note": "Use the row count observed on this run; do not hardcode a promised dataset size.",
                })
            except (OSError, csv.Error, UnicodeError) as exc:
                print(f"WARNING: could not parse the downloaded FastSocial file: {exc}", file=sys.stderr)
        else:
            print("WARNING: continuing with local IGshorts seed files only.", file=sys.stderr)

    seed_records_loaded = 0
    for filename in DEFAULT_SEED_FILES:
        path = args.seed_dir / filename
        if not path.exists():
            continue
        try:
            records = read_igshorts_seed(path)
            all_records.extend(records)
            seed_records_loaded += len(records)
            source_summary.append({
                "source": filename,
                "loaded_records": len(records),
                "note": "Legacy IGshorts research list; follower figures are rounded estimates and need revalidation.",
            })
        except (OSError, csv.Error, UnicodeError) as exc:
            print(f"WARNING: could not parse {path}: {exc}", file=sys.stderr)

    deduped = merge_records(all_records)
    output_csv = args.out_dir / "igshorts_profiles_normalized.csv"
    fieldnames = [
        "username", "display_name", "profile_url", "followers_count", "followers_count_precision",
        "followers_observed_date", "audience_group", "country_code", "country_or_region_raw",
        "country_semantics", "account_type", "category", "source_rank", "verified_status", "data_source",
        "source_url", "source_license", "data_quality_status", "source_count_values", "all_sources",
        "all_source_urls", "source_records_merged",
    ]
    with output_csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(deduped)

    groups: dict[str, int] = {}
    for row in deduped:
        group = row["audience_group"]
        groups[group] = groups.get(group, 0) + 1

    manifest = {
        "created_at_utc": utc_now(),
        "output_csv": output_csv.name,
        "input_records_total": len(all_records),
        "unique_profiles": len(deduped),
        "duplicates_merged": len(all_records) - len(deduped),
        "existing_igshorts_seed_records_loaded": seed_records_loaded,
        "audience_group_counts": groups,
        "source_summary": source_summary,
        "important_limitations": [
            "This is a seed index, not a complete index of Instagram users.",
            "FastSocial contains a tracked set of public accounts; attribute it as required by CC BY 4.0.",
            "Legacy IGshorts seed counts are rounded estimates and need revalidation before public display.",
            "Verification is unknown unless a source supplies a validated current field.",
            "Country/region fields may not mean residence or audience location.",
            "The script does not scrape Instagram or claim access to private/ordinary consumer accounts.",
        ],
        "audience_group_rules": {
            "Not measured yet": "no usable follower count",
            "Not grouped yet": "known count below 10,000",
            "Community": "10,000 to under 100,000",
            "Established": "100,000 to under 1,000,000",
            "Public": "1,000,000 to under 10,000,000",
            "Major": "10,000,000 and above",
        },
    }
    (args.out_dir / "import_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Input records: {len(all_records)}")
    print(f"Unique profiles: {len(deduped)}")
    print(f"Duplicates merged: {len(all_records) - len(deduped)}")
    print(f"CSV: {output_csv.resolve()}")
    print(f"Manifest: {(args.out_dir / 'import_manifest.json').resolve()}")
    if not any(source.get("source") == "FastSocial Top Charts" for source in source_summary):
        print("NOTICE: FastSocial was not imported; output contains only the local seed files that were found.")
    print("Reminder: this is not a complete Instagram account database.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
