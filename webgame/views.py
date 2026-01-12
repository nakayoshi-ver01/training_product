from django.shortcuts import render
from home_links import HOME_APPS


def home(request):
    return render(request, 'index.html', {"apps": HOME_APPS})
