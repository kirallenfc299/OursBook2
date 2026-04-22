# -*- coding: utf-8 -*-
"""
Deezer/iTunes Meta + Download das músicas completas (via YouTube/ISRC)
Autor: <Ytalo>
"""

import os
import csv
import re
import requests
from pathlib import Path
import lyricsgenius
from yt_dlp import YoutubeDL
from youtube_search import YoutubeSearch
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TIT2, TPE1, TALB, TDRC, TCON, TRCK, COMM, APIC
from tqdm import tqdm

# ===========================  CREDENCIAIS  ===========================
# Apaga ou deixa vazio as que não quiser ; única usada aqui é Genius (letras)
GENIUS_TOKEN = "86lRCdFs7Mucbcnug3P4SHkX5XUzXV49wCZlnGONSSKz0ZB8jDtYme9Q1KaVBq2R"
YOUTUBE_KEY  = "AIzaSyDP9bBwuXvkV2Yon-ZV83E5o0CU2FbKstQ"
# ====================================================================

OUTPUT_FOLDER = "músicas"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# --------------------------- helpers ---------------------------
def sanitize(name: str) -> str:
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()

def ydl_opts(fname: str) -> dict:
    return {
        'format': 'bestaudio/best',
        'outtmpl': fname,
        'quiet': True,
        'no_warnings': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]
    }

def yt_url_by_isrc(isrc: str, artist: str, track: str) -> str:
    "Tenta achar clipe via ISRC no YouTube Data; fallback procura texto comum."
    if isrc and isrc.strip():
        try:
            resp = requests.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={'part': 'snippet', 'type': 'video', 'q': isrc, 'key': 'AIzaSyDP9bBwuXvkV2Yon-ZV83E5o0CU2FbKstQ', 'maxResults': 3},
                timeout=5
            ).json()
            for v in resp.get('items', []):
                if artist.lower() in v['snippet']['title'].lower():
                    return f"https://youtu.be/{v['id']['videoId']}"
        except:
            pass
    q = f"{artist} - {track} official audio".replace(" ", "+")
    res = YoutubeSearch(q, max_results=1).to_dict()
    return f"https://youtu.be/{res[0]['id']}" if res else ""

def deezer_search_album(artist: str, album: str):
    """Busca álbum no Deezer. Retorna dict montado ou None."""
    r = requests.get("https://api.deezer.com/search/album",
                     params={"q": f'artist:"{artist}" album:"{album}"', "limit": 1})
    r.raise_for_status()
    data = r.json()
    if not data.get("data"):
        return None

    album_id = data["data"][0]["id"]
    alb = requests.get(f"https://api.deezer.com/album/{album_id}").json()
    if "error" in alb:
        return None

    tracks = []
    for i, t in enumerate(alb["tracks"]["data"], start=1):
        track_number = t.get("track_position") or t.get("position") or i

        tracks.append({
            "id": str(t.get("id", "")),
            "title": t.get("title", ""),
            "duration_ms": int(t.get("duration", 0)) * 1000,
            "track_number": int(track_number),
            "disc_number": t.get("disk_number", 1),
            "isrc": t.get("isrc", ""),
            "artist": t.get("artist", {}).get("name", artist),
            "explicit": t.get("explicit_lyrics", False)
        })

    return {
        "album_id": str(album_id),
        "name": alb.get("title", album),
        "release_date": alb.get("release_date", ""),
        "cover_url": alb.get("cover_xl", ""),
        "genres": ", ".join(g["name"] for g in alb.get("genres", {}).get("data", [])),
        "label": alb.get("label", ""),
        "tracks": tracks
    }

def itunes_best_cover(artist: str, album: str) -> str:
    """Pega arte 3000×3000 no iTunes."""
    try:
        res = requests.get("https://itunes.apple.com/search",
                           params={"term": f"{artist} {album}", "entity": "album", "limit": 1}).json()
        if res["resultCount"] > 0:
            return res["results"][0]["artworkUrl100"].replace("100x100", "3000x3000")
    except:
        pass
    return None

def mb_year_and_label(artist: str, album: str) -> (str, str):
    """Tenta pegar ano correto e selo via MusicBrainz (sem autenticação)."""
    try:
        url = "https://musicbrainz.org/ws/2/release"
        params = {"query": f'artist:"{artist}" AND release:"{album}"', "fmt": "json", "limit": 1}
        rels = requests.get(url, params=params,
                            headers={"User-Agent": "MetaGetter/1.0 (contato@seuemail.com)"}).json()
        if rels["releases"]:
            r = rels["releases"][0]
            y = r.get("date")  # pode vir "2003-03-01"
            lbls = ", ".join(l["name"] for l in r.get("label-info", []) if l.get("label"))
            return y[:4] if y else "", lbls
    except:
        pass
    return "", ""

def tag_file(path: Path, data: dict, cover_bytes: bytes = None):
    audio = MP3(path, ID3=ID3)
    try:
        audio.add_tags()
    except:
        pass
    audio.tags.add(TIT2(encoding=3, text=data['track_title']))
    audio.tags.add(TPE1(encoding=3, text=data['artist_name']))
    audio.tags.add(TALB(encoding=3, text=data['album_name']))
    audio.tags.add(TDRC(encoding=3, text=data['album_year']))
    audio.tags.add(TCON(encoding=3, text=data.get('genres', '')))
    audio.tags.add(TRCK(encoding=3, text=str(data['track_number'])))
    if data.get('lyrics'):
        audio.tags.add(COMM(encoding=3, lang='por', desc='', text=data['lyrics'][:500]))
    if cover_bytes:
        audio.tags.add(APIC(encoding=3, mime='image/jpeg', type=3, desc='Front Cover', data=cover_bytes))
    audio.save()

# ------------------------ fluxo principal ------------------------
def main():
    artist_name = input("🎤 Nome do artista: ").strip()
    album_name  = input("💿 Nome do álbum: ").strip()
    max_faixas  = int(input("🔢 Limite de faixas (padrão 20): ") or "20")
    if not album_name:
        print("❌ Álbum obrigatório."); return

    genius = lyricsgenius.Genius(GENIUS_TOKEN, remove_section_headers=True, skip_non_songs=True) if GENIUS_TOKEN else None

    print(f"\n🔍 Buscando álbum '{album_name}' de {artist_name}...")
    album_data = deezer_search_album(artist_name, album_name)
    if not album_data:
        print("❌ Álbum não encontrado no Deezer."); return

    # Capa gigante via iTunes se disponível
    album_data["cover_url"] = itunes_best_cover(artist_name, album_name) or album_data["cover_url"]
    # Ano e selo mais corretos via MusicBrainz (opcional)
    year_mb, label_mb = mb_year_and_label(artist_name, album_name)
    album_data["release_year"]   = year_mb   if year_mb   else album_data["release_date"][:4]
    album_data["label"]          = label_mb  if label_mb  else album_data.get("label", "")

    tracks = album_data["tracks"][:max_faixas]

    # Baixa capa única para todas as faixas
    cover_bytes = None
    try:
        cover_bytes = requests.get(album_data["cover_url"], timeout=10).content
    except:
        pass

    tracks_csv = []
    print(f"✅ {len(tracks)} faixas encontradas. Baixando áudios...\n")

    for idx, t in enumerate(tqdm(tracks, desc="Download")):
        row = {
            "artist_name": artist_name,
            "album_name": album_data["name"],
            "album_year": album_data["release_year"],
            "album_label": album_data["label"],
            "track_number": t["track_number"],
            "track_title": t["title"],
            "isrc": t.get("isrc", ""),
            "disc_number": 1,
            "cover_url": album_data["cover_url"],
            "duration_ms": t["duration_ms"],
            "genres": album_data.get("genres", ""),
            "lyrics": ""
        }

        # Letra via Genius
        if genius:
            try:
                song = genius.search_song(t["title"], artist_name)
                row["lyrics"] = song.lyrics.strip() if song else ""
            except:
                pass

        tracks_csv.append(row)

        # YouTube
        filename = sanitize(f"{row['track_number']:02d} - {row['track_title']}")
        audio_path = Path(OUTPUT_FOLDER) / f"{filename}.%(ext)s"
        yt_url = yt_url_by_isrc(row["isrc"], artist_name, row["track_title"])
        if not yt_url:
            yt_url = yt_url_by_isrc('', artist_name, row["track_title"])

        if yt_url:
            try:
                with YoutubeDL(ydl_opts(str(audio_path))) as ydl:
                    ydl.download([yt_url])
                    down_files = list(Path(OUTPUT_FOLDER).glob(f"{filename}*"))
                    if down_files:
                        final = down_files[0].with_suffix('.mp3')
                        down_files[0].replace(final)
                        tag_file(final, {**row, "album_year": album_data["release_year"]}, cover_bytes)
            except Exception as e:
                tqdm.write(f"⚠️ Falha ao baixar {row['track_title']}: {e}")

    csv_name = sanitize(f"metadados_{artist_name}_{album_name}") + ".csv"
    with open(csv_name, 'w', newline='', encoding='utf-8') as f:
        if tracks_csv:
            writer = csv.DictWriter(f, fieldnames=tracks_csv[0].keys())
            writer.writeheader()
            writer.writerows(tracks_csv)

    print("\n🎉 CONCLUÍDO!")
    print(f"📁 Pasta de músicas: {OUTPUT_FOLDER}")
    print(f"📄 CSV: {csv_name}")

if __name__ == "__main__":
    main()
