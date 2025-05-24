import math
import io
import base64
import matplotlib.pyplot as plt
import numpy as np
import requests
from datetime import datetime, timedelta, timezone
from pysolar.solar import get_azimuth
from utils.equations import *
from zoneinfo import ZoneInfo
# from timezonefinder import TimezoneFinder

# def obtener_zona_horaria_offline(latitud, longitud):
#     tf = TimezoneFinder()
#     zona = tf.timezone_at(lat=latitud, lng=longitud)
#     return zona  # ej: "Europe/Madrid"

def construir_datetime_utc(dia_del_ano, hora, minutos, tz_local='Europe/Madrid'):
    año_actual = datetime.now().year
    fecha_local = datetime(año_actual, 1, 1, tzinfo=ZoneInfo(tz_local)) + timedelta(days=dia_del_ano - 1)
    fecha_local = fecha_local.replace(hour=hora, minute=minutos)
    return fecha_local.astimezone(timezone.utc)

def figura_to_base64(figura):
    buf = io.BytesIO()
    figura.savefig(buf, format="png", bbox_inches="tight", dpi=150)
    buf.seek(0)
    img_bytes = buf.read()
    encoded = base64.b64encode(img_bytes).decode()
    return encoded

def obtener_horas_dia_real(latitud, longitud, dia_del_ano, tz_local='Europe/Madrid'):
    año_actual = datetime.now().year
    fecha = datetime(año_actual, 1, 1) + timedelta(days=dia_del_ano - 1)
    fecha_str = fecha.strftime("%Y-%m-%d")

    url = f"https://api.sunrise-sunset.org/json?lat={latitud}&lng={longitud}&date={fecha_str}&formatted=0"
    response = requests.get(url)
    data = response.json()

    sunrise_utc = datetime.fromisoformat(data['results']['sunrise']).replace(tzinfo=timezone.utc)
    sunset_utc = datetime.fromisoformat(data['results']['sunset']).replace(tzinfo=timezone.utc)

    sunrise_local = sunrise_utc.astimezone(ZoneInfo(tz_local))
    sunset_local = sunset_utc.astimezone(ZoneInfo(tz_local))

    hora_salida = sunrise_local.hour + sunrise_local.minute / 60
    hora_puesta = sunset_local.hour + sunset_local.minute / 60

    return hora_salida, hora_puesta

def sombrear_region(ax, angulo_inicio_deg, angulo_final_deg, color='black', alpha=0.2):
    theta = np.linspace(math.radians(angulo_inicio_deg), math.radians(angulo_final_deg), 100)
    r = np.ones_like(theta)

    # Añadir el centro (ángulo medio con radio 0)
    theta = np.concatenate(([theta[0]], theta, [theta[-1]]))
    r = np.concatenate(([0], r, [0]))

    ax.fill(theta, r, color=color, alpha=alpha, zorder=0)

def visualizar_brujula_dia_noche(orientacion_pared, azimut, dia, sombra, latitud, longitud):
    # tz_local = obtener_zona_horaria_offline(latitud, longitud)
    salida, puesta = obtener_horas_dia_real(latitud, longitud, dia)
    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw={'projection': 'polar'})
    # ax.set_facecolor("black" if sombra else "white")
    ax.set_theta_zero_location('N')
    ax.set_theta_direction(-1)

    # Pintar zonas nocturnas en gris usando azimut por hora
    # for hora in np.linspace(0, 24, 360):
    #     if hora < salida or hora > puesta:
    #         H = 15 * (hora - 12)
    #         az = acimut_solar(H, latitud, declinacion)
    #         ax.plot([math.radians(az), math.radians(az)], [0, 1], color='gray', alpha=0.3, linewidth=1)

    fecha_hora_utc_final = construir_datetime_utc(dia, int(salida), int((salida % 1) * 60))
    fecha_hora_utc_inicio = construir_datetime_utc(dia, int(puesta), int((puesta % 1) * 60))

    angulo_inicio_acimut = get_azimuth(latitud, longitud, fecha_hora_utc_inicio)
    angulo_final_acimut = get_azimuth(latitud, longitud, fecha_hora_utc_final)
    # print(f"Salida: {salida}, Puesta: {puesta}")
    # print(f"Ángulo inicio acimut: {angulo_inicio_acimut}, Ángulo final acimut: {angulo_final_acimut}")
    # sombrear_region(ax, angulo_inicio_acimut, angulo_final_acimut, alpha=0.2)

    if angulo_inicio_acimut < angulo_final_acimut:
        sombrear_region(ax, angulo_inicio_acimut, angulo_final_acimut, alpha=0.2)
    else:
        sombrear_region(ax, angulo_inicio_acimut, 360, alpha=0.2)
        sombrear_region(ax, 0, angulo_final_acimut, alpha=0.2)

        # Límites de sombra como líneas hasta el borde (radio = 1)
    corte_izq = math.radians((orientacion_pared - 90) % 360)
    corte_der = math.radians((orientacion_pared + 90) % 360)

    ax.plot([corte_izq, corte_izq], [0, 0.5], color='gray', linestyle='--', linewidth=2, label='Límite sombra')
    ax.plot([corte_der, corte_der], [0, 0.5], color='gray', linestyle='--', linewidth=2)

    ax.arrow(math.radians(orientacion_pared), 0, 0, 1, width=0.05, color='blue', label='Pared')
    ax.arrow(math.radians(azimut), 0, 0, 1, width=0.05, color='orange', label='Sol')

    ax.set_rticks([])
    ax.set_title("Orientación vs Sol", va='bottom', color='white' if sombra else 'black')
    ax.legend(loc='upper right', facecolor="black" if sombra else "white", labelcolor="white" if sombra else "black")
    return fig
