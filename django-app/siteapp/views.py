from django.http import JsonResponse
from django.shortcuts import render
from django.templatetags.static import static

from .models import (
    ContactLink,
    LogEntry,
    Moment,
    NowCard,
    Project,
    SiteProfile,
)

BASE_CATEGORIES = ["全部", "站点", "设计", "工程", "无线电", "日常"]


def asset_url(path):
    if not path:
        return ""
    if path.startswith("../assets/"):
        path = path[3:]
    if path.startswith("assets/"):
        return static(path)
    return path


def build_site_content():
    profile = SiteProfile.load()
    projects = list(Project.objects.prefetch_related("gallery"))
    project_map = {project.pk: project for project in projects}

    project_data = []
    for project in projects:
        gallery = [
            {
                "src": asset_url(image.image_path),
                "title": image.title,
                "caption": image.caption,
            }
            for image in project.gallery.all()
        ]
        project_data.append(
            {
                "index": project.display_index,
                "title": project.title,
                "subtitle": project.subtitle,
                "description": project.description,
                "tags": project.tag_list(),
                "visual": project.visual,
                "image": asset_url(project.image_path),
                "alt": project.image_alt,
                "galleryKey": f"project-{project.pk}",
                "gallery": gallery,
                "link": project.link,
                "meta": project.meta,
                "featured": project.featured,
            }
        )

    log_entries = []
    for entry in LogEntry.objects.all():
        action = None
        if entry.action_type == "gallery" and entry.gallery_project_id:
            linked_project = project_map.get(entry.gallery_project_id)
            if linked_project:
                action = {
                    "type": "gallery",
                    "label": entry.action_label,
                    "galleryKey": f"project-{linked_project.pk}",
                    "projectTitle": linked_project.title,
                }
        elif entry.action_type == "link" and entry.action_href:
            action = {
                "type": "link",
                "label": entry.action_label,
                "href": entry.action_href,
            }
        log_entries.append(
            {
                "date": entry.date,
                "tags": entry.tag_list(),
                "title": entry.title,
                "excerpt": entry.excerpt,
                "action": action,
            }
        )

    now_cards = [
        {
            "label": card.label,
            "title": card.title,
            "items": card.item_list(),
        }
        for card in NowCard.objects.all()
    ]
    contact_links = [
        {
            "label": link.label,
            "value": link.value,
            "href": link.href,
        }
        for link in ContactLink.objects.all()
    ]

    return {
        "seo": {
            "title": profile.seo_title,
            "description": profile.seo_description,
        },
        "identity": {
            "kicker": profile.hero_kicker,
            "title": profile.hero_title,
            "lead": profile.hero_lead,
            "primaryCta": {
                "label": profile.primary_cta_label,
                "href": profile.primary_cta_href,
            },
            "secondaryCta": {
                "label": profile.secondary_cta_label,
                "href": profile.secondary_cta_href,
            },
            "coordinates": profile.coordinates,
            "grid": profile.grid,
            "status": profile.status,
            "station": [
                ["CALLSIGN", profile.callsign],
                ["QTH", profile.qth],
                ["GRID", profile.grid],
                ["BANDS", profile.bands],
            ],
            "ticker": [
                item.strip()
                for item in profile.ticker.splitlines()
                if item.strip()
            ],
        },
        "work": {
            "kicker": profile.work_kicker,
            "title": profile.work_title,
            "intro": profile.work_intro,
            "projects": project_data,
        },
        "log": {
            "kicker": profile.log_kicker,
            "title": profile.log_title,
            "intro": profile.log_intro,
            "entries": log_entries,
            "qsl": {
                "kicker": profile.qsl_kicker,
                "title": profile.qsl_title,
                "text": profile.qsl_text,
                "galleryLabel": profile.qsl_gallery_label,
                "qrzLabel": profile.qsl_qrz_label,
                "href": profile.qsl_href,
            },
        },
        "now": {
            "kicker": profile.now_kicker,
            "title": profile.now_title,
            "intro": profile.now_intro,
            "cards": now_cards,
        },
        "contact": {
            "kicker": profile.contact_kicker,
            "title": profile.contact_title,
            "lead": profile.contact_lead,
            "callsign": profile.callsign,
            "note": profile.contact_note,
            "links": contact_links,
        },
    }


def build_moments_data():
    profile = SiteProfile.load()
    moments = Moment.objects.filter(published=True)
    entries = []
    for moment in moments:
        link = None
        if moment.link_href:
            link = {
                "label": moment.link_label or "打开链接",
                "href": moment.link_href,
            }
        entries.append(
            {
                "date": moment.date,
                "time": moment.time,
                "category": moment.category,
                "tags": moment.tag_list(),
                "text": moment.text,
                "image": asset_url(moment.image_path),
                "imageAlt": moment.image_alt,
                "imageCaption": moment.image_caption,
                "link": link,
            }
        )

    categories = BASE_CATEGORIES + [
        category
        for category in dict.fromkeys(
            moment.category for moment in moments if moment.category
        )
        if category not in BASE_CATEGORIES
    ]
    return {
        "updated": entries[0]["date"] if entries else "",
        "status": {
            "title": profile.moments_status_title,
            "note": profile.moments_status_note,
        },
        "categories": categories,
        "entries": entries,
    }


def home(request):
    site_content = build_site_content()
    first_gallery = (
        Project.objects.filter(gallery__isnull=False)
        .prefetch_related("gallery")
        .first()
    )
    qsl_image = ""
    if first_gallery and first_gallery.gallery.exists():
        qsl_image = asset_url(first_gallery.gallery.first().image_path)
    return render(
        request,
        "home.html",
        {"site_content": site_content, "qsl_image_url": qsl_image},
    )


def moments_page(request):
    return render(
        request,
        "moments.html",
        {"moments_data": build_moments_data()},
    )


def site_api(request):
    return JsonResponse({"content": build_site_content()})


def moments_api(request):
    return JsonResponse(build_moments_data())

