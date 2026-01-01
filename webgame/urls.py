from django.urls import path, include

urlpatterns = [
    path('', include('game.urls')),
    path('tic-tac-toe/', include('game.urls')),
]
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
