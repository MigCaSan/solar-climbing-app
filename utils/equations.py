import math
from datetime import datetime
import requests
import numpy as np

def calcular_angulo_horario(hora_local):
    """Calcula el ángulo horario en grados desde la hora local"""
    return 15 * (hora_local - 12)

def horas_salida_y_puesta(latitud, declinacion):
    lat_rad = math.radians(latitud)
    dec_rad = math.radians(declinacion)
    cos_H = -math.tan(lat_rad) * math.tan(dec_rad)
    if cos_H <= -1:
        return 0, 24
    elif cos_H >= 1:
        return None, None
    else:
        H = math.degrees(math.acos(cos_H))
        salida = 12 - H / 15
        puesta = 12 + H / 15
        return salida, puesta
    
def declinacion_solar(dia_del_ano):
    return -23.44 * math.cos(math.radians((360 / 365) * (dia_del_ano + 10)))

def hora_a_angulo_horario(hora, minutos):
    hora_solar = hora + minutos / 60.0
    return 15 * (hora_solar - 12)

def hay_sombra(azimut, orientacion_pared):
    diferencia = abs((azimut - orientacion_pared + 180) % 360 - 180)
    return diferencia > 90


