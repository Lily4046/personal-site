from django.urls import path

from . import views

app_name = "siteapp"

urlpatterns = [
    path("", views.home, name="home"),
    path("moments/", views.moments_page, name="moments"),
    path("api/site/", views.site_api, name="site_api"),
    path("api/moments/", views.moments_api, name="moments_api"),
]

