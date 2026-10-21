import json
from pathlib import Path

from django.core.management.base import BaseCommand

from siteapp.models import (
    ContactLink,
    LogEntry,
    Moment,
    NowCard,
    Project,
    ProjectImage,
    SiteProfile,
)


class Command(BaseCommand):
    help = "Load the existing BG2HHW site content into the Django database."

    def handle(self, *args, **options):
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "site_seed.json"
        seed = json.loads(seed_path.read_text(encoding="utf-8"))
        content = seed["content"]
        identity = content["identity"]
        log = content["log"]
        qsl = log["qsl"]
        moments = seed["moments"]

        profile = SiteProfile.load()
        profile.seo_title = content["seo"]["title"]
        profile.seo_description = content["seo"]["description"]
        profile.hero_kicker = identity["kicker"]
        profile.hero_title = identity["title"]
        profile.hero_lead = identity["lead"]
        profile.primary_cta_label = identity["primaryCta"]["label"]
        profile.primary_cta_href = identity["primaryCta"]["href"]
        profile.secondary_cta_label = identity["secondaryCta"]["label"]
        profile.secondary_cta_href = identity["secondaryCta"]["href"]
        profile.coordinates = identity["coordinates"]
        profile.grid = identity["grid"]
        profile.status = identity["status"]
        profile.callsign = identity["station"][0][1]
        profile.qth = identity["station"][1][1]
        profile.bands = identity["station"][3][1]
        profile.ticker = "\n".join(identity["ticker"])

        profile.work_kicker = content["work"]["kicker"]
        profile.work_title = content["work"]["title"]
        profile.work_intro = content["work"]["intro"]
        profile.log_kicker = log["kicker"]
        profile.log_title = log["title"]
        profile.log_intro = log["intro"]
        profile.now_kicker = content["now"]["kicker"]
        profile.now_title = content["now"]["title"]
        profile.now_intro = content["now"]["intro"]
        profile.contact_kicker = content["contact"]["kicker"]
        profile.contact_title = content["contact"]["title"]
        profile.contact_lead = content["contact"]["lead"]
        profile.contact_note = content["contact"]["note"]
        profile.qsl_kicker = qsl["kicker"]
        profile.qsl_title = qsl["title"]
        profile.qsl_text = qsl["text"]
        profile.qsl_gallery_label = qsl["galleryLabel"]
        profile.qsl_qrz_label = qsl["qrzLabel"]
        profile.qsl_href = qsl["href"]
        profile.moments_status_title = moments["status"]["title"]
        profile.moments_status_note = moments["status"]["note"]
        profile.save()

        project_by_title = {}
        for order, item in enumerate(content["work"]["projects"], start=1):
            project, _ = Project.objects.update_or_create(
                title=item["title"],
                defaults={
                    "display_index": item["index"],
                    "subtitle": item.get("subtitle", ""),
                    "description": item.get("description", ""),
                    "tags": ", ".join(item.get("tags", [])),
                    "visual": item.get("visual", "image"),
                    "image_path": item.get("image", ""),
                    "image_alt": item.get("alt", ""),
                    "meta": item.get("meta", ""),
                    "link": item.get("link", ""),
                    "featured": item.get("featured", False),
                    "order": order,
                },
            )
            project_by_title[project.title] = project
            gallery = item.get("gallery", [])
            project.gallery.exclude(order__lte=len(gallery)).delete()
            for image_order, image in enumerate(gallery, start=1):
                ProjectImage.objects.update_or_create(
                    project=project,
                    order=image_order,
                    defaults={
                        "image_path": image["src"],
                        "title": image.get("title", ""),
                        "caption": image.get("caption", ""),
                    },
                )

        for order, item in enumerate(log["entries"], start=1):
            action = item.get("action") or {}
            gallery_project = project_by_title.get(action.get("projectTitle"))
            LogEntry.objects.update_or_create(
                title=item["title"],
                defaults={
                    "date": item["date"],
                    "tags": ", ".join(item.get("tags", [])),
                    "excerpt": item["excerpt"],
                    "action_type": action.get("type", "none"),
                    "action_label": action.get("label", ""),
                    "action_href": action.get("href", ""),
                    "gallery_project": gallery_project,
                    "order": order,
                },
            )

        for order, card in enumerate(content["now"]["cards"], start=1):
            NowCard.objects.update_or_create(
                title=card["title"],
                defaults={
                    "label": card["label"],
                    "items": "\n".join(card["items"]),
                    "order": order,
                },
            )

        for order, link in enumerate(content["contact"]["links"], start=1):
            ContactLink.objects.update_or_create(
                label=link["label"],
                defaults={
                    "value": link["value"],
                    "href": link["href"],
                    "order": order,
                },
            )

        for entry in moments["entries"]:
            link = entry.get("link") or {}
            Moment.objects.update_or_create(
                date=entry["date"],
                time=entry.get("time", ""),
                text=entry["text"],
                defaults={
                    "category": entry["category"],
                    "tags": ", ".join(entry.get("tags", [])),
                    "image_path": entry.get("image", ""),
                    "image_alt": entry.get("imageAlt", ""),
                    "image_caption": entry.get("imageCaption", ""),
                    "link_label": link.get("label", ""),
                    "link_href": link.get("href", ""),
                    "published": True,
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {Project.objects.count()} projects, "
                f"{LogEntry.objects.count()} log entries and "
                f"{Moment.objects.count()} moments."
            )
        )

