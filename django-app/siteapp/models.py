from django.db import models


class SiteProfile(models.Model):
    seo_title = models.CharField(max_length=200, default="BG2HHW · 把信号发向更远的地方")
    seo_description = models.TextField(
        default="BG2HHW 的个人主页：业余无线电、工程实践、印刷设计与前端开发。"
    )

    callsign = models.CharField(max_length=32, default="BG2HHW")
    qth = models.CharField(
        max_length=255,
        default="黑龙江省哈尔滨市南岗区哈尔滨工业大学A01公寓",
    )
    grid = models.CharField(max_length=16, default="PN35HS")
    bands = models.CharField(max_length=64, default="HF · VHF · UHF")
    coordinates = models.CharField(max_length=80, default="45°45′N / 126°38′E")
    status = models.CharField(max_length=80, default="ON AIR / SOMETIMES")
    ticker = models.TextField(
        default="业余无线电\n印刷设计\n前端开发\n工程实践\n航空航天\n卫星通信\n73"
    )

    hero_kicker = models.CharField(
        max_length=160, default="AMATEUR RADIO · ENGINEERING · HARBIN"
    )
    hero_title = models.TextField(
        default='把信号，<br>发向<span class="accent">更远</span>的<span class="title-tail">地方。</span>'
    )
    hero_lead = models.TextField(default="我是 BG2HHW，一名在哈尔滨的火腿。")
    primary_cta_label = models.CharField(max_length=50, default="看看作品")
    primary_cta_href = models.CharField(max_length=200, default="#work")
    secondary_cta_label = models.CharField(max_length=50, default="打个招呼")
    secondary_cta_href = models.CharField(max_length=200, default="#contact")

    work_kicker = models.CharField(max_length=80, default="01 / SELECTED WORK")
    work_title = models.CharField(max_length=120, default="最近做过的一些事")
    work_intro = models.TextField(
        default="从一张卡片到一台装置，都是把想法落到现实里的练习。"
    )
    log_kicker = models.CharField(max_length=80, default="02 / FIELD LOG")
    log_title = models.CharField(max_length=120, default="把过程也留下来")
    log_intro = models.TextField(
        default="不只展示结果，也记下做东西时绕过的路、做过的取舍。"
    )
    now_kicker = models.CharField(max_length=80, default="03 / NOW")
    now_title = models.CharField(max_length=120, default="此刻，正在发生")
    now_intro = models.TextField(default="一些正在进行、还没完成的小事。")
    contact_kicker = models.CharField(max_length=80, default="04 / CONTACT")
    contact_title = models.CharField(max_length=120, default="保持联络。")
    contact_lead = models.TextField(
        default="想聊无线电、设计、代码，或者只是想交换一张 QSL 卡，都欢迎。"
    )
    contact_note = models.CharField(
        max_length=160, default="QSL VIA BG2HHW · DIRECT / BUREAU"
    )

    qsl_kicker = models.CharField(max_length=80, default="QSL / DIRECT")
    qsl_title = models.CharField(max_length=120, default="想交换一张卡？")
    qsl_text = models.CharField(
        max_length=160, default="QSL VIA BG2HHW · DIRECT / BUREAU"
    )
    qsl_gallery_label = models.CharField(max_length=80, default="查看卡片设计")
    qsl_qrz_label = models.CharField(max_length=80, default="QRZ / BG2HHW")
    qsl_href = models.URLField(default="https://www.qrz.com/db/BG2HHW")

    moments_status_title = models.CharField(max_length=140, default="在哈尔滨，整理主页。")
    moments_status_note = models.TextField(
        default="正在把散落的项目、卡片和文字放到同一个坐标里。"
    )

    class Meta:
        verbose_name = "站点设置"
        verbose_name_plural = "站点设置"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        profile, _ = cls.objects.get_or_create(pk=1)
        return profile

    def __str__(self):
        return "BG2HHW 站点设置"


class Project(models.Model):
    VISUAL_CHOICES = [
        ("image", "图片"),
        ("poster", "海报"),
        ("ui", "界面"),
    ]
    display_index = models.CharField("编号", max_length=20, default="01")
    title = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    tags = models.CharField(
        "标签（用逗号分隔）", max_length=300, blank=True
    )
    visual = models.CharField(
        "视觉类型", max_length=20, choices=VISUAL_CHOICES, default="image"
    )
    image_path = models.CharField(
        "图片路径", max_length=300, blank=True,
        help_text="例如 assets/qsl-laterano-1400.webp"
    )
    image_alt = models.CharField("图片替代文字", max_length=300, blank=True)
    meta = models.CharField("底部信息", max_length=200, blank=True)
    link = models.CharField("项目链接", max_length=300, blank=True)
    featured = models.BooleanField("宽版展示", default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "作品"
        verbose_name_plural = "作品"

    def tag_list(self):
        return [tag.strip() for tag in self.tags.split(",") if tag.strip()]

    def __str__(self):
        return self.title


class ProjectImage(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="gallery"
    )
    image_path = models.CharField("图片路径", max_length=300)
    title = models.CharField(max_length=120, blank=True)
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "作品画廊图片"
        verbose_name_plural = "作品画廊图片"

    def __str__(self):
        return self.title or self.image_path


class LogEntry(models.Model):
    ACTION_CHOICES = [
        ("gallery", "打开作品画廊"),
        ("link", "打开链接"),
        ("none", "无操作"),
    ]
    date = models.CharField("日期", max_length=80)
    tags = models.CharField("标签（用逗号分隔）", max_length=300, blank=True)
    title = models.CharField(max_length=160)
    excerpt = models.TextField()
    action_type = models.CharField(
        "操作类型", max_length=20, choices=ACTION_CHOICES, default="none"
    )
    action_label = models.CharField("按钮文字", max_length=80, blank=True)
    action_href = models.CharField("操作链接", max_length=300, blank=True)
    gallery_project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="关联作品画廊",
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "札记"
        verbose_name_plural = "札记"

    def tag_list(self):
        return [tag.strip() for tag in self.tags.split(",") if tag.strip()]

    def __str__(self):
        return self.title


class NowCard(models.Model):
    label = models.CharField(max_length=80)
    title = models.CharField(max_length=120)
    items = models.TextField(
        "事项（每行一条）",
        help_text="每一行会显示成一个列表项。",
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "现在卡片"
        verbose_name_plural = "现在卡片"

    def item_list(self):
        return [item.strip() for item in self.items.splitlines() if item.strip()]

    def __str__(self):
        return self.title


class ContactLink(models.Model):
    label = models.CharField(max_length=80)
    value = models.CharField(max_length=160)
    href = models.URLField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "联系链接"
        verbose_name_plural = "联系链接"

    def __str__(self):
        return self.label


class Moment(models.Model):
    date = models.CharField("日期", max_length=40)
    time = models.CharField("时间", max_length=40, blank=True)
    category = models.CharField("分类", max_length=40, default="日常")
    tags = models.CharField("标签（用逗号分隔）", max_length=300, blank=True)
    text = models.TextField("正文")
    image_path = models.CharField("图片路径", max_length=300, blank=True)
    image_alt = models.CharField("图片替代文字", max_length=300, blank=True)
    image_caption = models.CharField("图片说明", max_length=200, blank=True)
    link_label = models.CharField("链接文字", max_length=80, blank=True)
    link_href = models.CharField("链接地址", max_length=300, blank=True)
    published = models.BooleanField("发布", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "id"]
        verbose_name = "动态"
        verbose_name_plural = "动态"

    def tag_list(self):
        return [tag.strip() for tag in self.tags.split(",") if tag.strip()]

    def __str__(self):
        return self.text[:60]
