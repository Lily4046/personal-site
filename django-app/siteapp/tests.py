from django.test import TestCase

from .models import ContactLink, Moment, NowCard, Project, SiteProfile


class SiteViewsTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.profile = SiteProfile.load()
        cls.profile.hero_lead = "测试中的火腿介绍。"
        cls.profile.save()
        Project.objects.create(
            display_index="01",
            title="测试作品",
            visual="image",
            image_path="assets/qsl-laterano-1400.webp",
            featured=True,
        )
        NowCard.objects.create(label="BUILDING", title="正在做", items="一条\n两条")
        ContactLink.objects.create(
            label="GitHub",
            value="GitHub 主页",
            href="https://github.com/Lily4046",
        )
        Moment.objects.create(
            date="2026.10.22",
            time="02:00",
            category="站点",
            text="公开动态",
            published=True,
        )
        Moment.objects.create(
            date="2026.10.22",
            time="02:01",
            category="站点",
            text="隐藏动态",
            published=False,
        )

    def test_home_renders_project_and_profile(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        content = response.context["site_content"]
        self.assertEqual(content["identity"]["lead"], "测试中的火腿介绍。")
        self.assertEqual(content["work"]["projects"][0]["title"], "测试作品")

    def test_site_api_returns_frontend_shape(self):
        response = self.client.get("/api/site/")
        self.assertEqual(response.status_code, 200)
        data = response.json()["content"]
        self.assertEqual(data["identity"]["grid"], "PN35HS")
        self.assertEqual(len(data["work"]["projects"]), 1)

    def test_moments_api_only_returns_published_entries(self):
        response = self.client.get("/api/moments/")
        self.assertEqual(response.status_code, 200)
        entries = response.json()["entries"]
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["text"], "公开动态")

