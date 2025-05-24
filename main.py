from utils.equations import *
from utils.vis import *
import streamlit as st
import matplotlib.pyplot as plt
from datetime import datetime
from pysolar.solar import get_azimuth

# -------- INTERFAZ -------- #

st.set_page_config(layout="wide")
st.markdown(
    """
    <h1 style='text-align: center;'>🧗‍♂️ Calculadora Solar para Sectores de Escalada</h1>
    """,
    unsafe_allow_html=True
)

col1, col2 = st.columns([1, 2])

with col1:
    hora = st.slider("Hora", 0, 23, 12, step=1)
    minutos = st.slider("Minutos", 0, 59, 0, step=1)
    orientacion_pared = st.slider("Orientación pared (0°=N, 90°=E...)", 0, 359, 45, step=1)
    latitud = st.number_input("Latitud", value=38.27)
    longitud = st.number_input("Longitud", value=-3.43)
    dia = st.slider("Día del año", 1, 365, datetime.now().timetuple().tm_yday, step=1)
    # tz_local = obtener_zona_horaria_offline(latitud, longitud)
    fecha_hora_utc = construir_datetime_utc(dia, hora, minutos)

    H = hora_a_angulo_horario(hora, minutos)
    declinacion = declinacion_solar(dia)
    azimut = get_azimuth(latitud, longitud, fecha_hora_utc)
    # print(f"Azimut calculado: {azimut}°")
    sombra = hay_sombra(azimut, orientacion_pared)

with col2:
    figura = visualizar_brujula_dia_noche(orientacion_pared, azimut, dia, sombra, latitud, longitud)

    st.markdown(
        """
        <div style="width: 50%; margin: auto;">
            <img src="data:image/png;base64,{}" style="width: 100%;"/>
        </div>
        """.format(figura_to_base64(figura)),
        unsafe_allow_html=True
    )

    estado_texto = "🌑 Sombra" if sombra else "☀️ Sol"
    st.markdown(
        f"""
        <div style="text-align: center; margin-top: 10px;">
            <h3>Estado de la pared: <strong>{estado_texto}</strong></h3>
        </div>
        """,
        unsafe_allow_html=True
    )
