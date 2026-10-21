from django.contrib import admin

from .models import (
    ContactLink,
    LogEntry,
    Moment,
    NowCard,
    Project,
    ProjectImage,
    SiteProfile,
)


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1


@admin.register(SiteProfile)
class SiteProfileAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "SEO",
            {"fields": ("seo_title", "seo_description")},
        ),
        (
            "身份与电台",
            {
                "fields": (
                    "callsign",
                    "qth",
                    "grid",
                    "bands",
                    "coordinates",
                    "status",
                    "ticker",
                )
            },
        ),
        (
            "首屏",
            {
                "fields": (
                    "hero_kicker",
                    "hero_title",
                    "hero_lead",
                    "primary_cta_label",
                    "primary_cta_href",
                    "secondary_cta_label",
                    "secondary_cta_href",
                )
            },
        ),
        (
            "栏目标题",
            {
                "fields": (
                    "work_kicker",
                    "work_title",
                    "work_intro",
                    "log_kicker",
                    "log_title",
                    "log_intro",
                    "now_kicker",
                    "now_title",
                    "now_intro",
                    "contact_kicker",
                    "contact_title",
                    "contact_lead",
                    "contact_note",
                )
            },
        ),
        (
            "QSL 与动态",
            {
                "fields": (
                    "qsl_kicker",
                    "qsl_title",
                    "qsl_text",
                    "qsl_gallery_label",
                    "qsl_qrz_label",
                    "qsl_href",
                    "moments_status_title",
                    "moments_status_note",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        return not SiteProfile.objects.exists()


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("display_index", "title", "visual", "featured", "order")
    list_editable = ("featured", "order")
    inlines = [ProjectImageInline]


@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    list_display = ("date", "title", "action_type", "order")
    list_editable = ("order",)


@admin.register(NowCard)
class NowCardAdmin(admin.ModelAdmin):
    list_display = ("label", "title", "order")
    list_editable = ("order",)


@admin.register(ContactLink)
class ContactLinkAdmin(admin.ModelAdmin):
    list_display = ("label", "value", "order")
    list_editable = ("order",)


@admin.register(Moment)
class MomentAdmin(admin.ModelAdmin):
    list_display = ("date", "time", "category", "short_text", "published")
    list_filter = ("published", "category")
    search_fields = ("text", "tags")
    list_editable = ("published",)

    @admin.display(description="正文")
    def short_text(self, obj):
        return obj.text[:70]

