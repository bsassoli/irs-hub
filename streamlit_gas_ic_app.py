import numpy as np
import matplotlib.pyplot as plt
import streamlit as st

# ------------------------------------------------------------
# App: Gas ideale e intervalli di confidenza
# ------------------------------------------------------------

st.set_page_config(page_title="Gas e intervalli di confidenza", layout="centered")

st.title("Gas ideale e intervalli di confidenza")
st.markdown(
    """
Questo è un piccolo esperimento interattivo pensato per una lezione di
**Filosofia della Scienza / Statistica Inferenziale**.

Immaginiamo un gas ideale chiuso in un contenitore rigido, a temperatura costante.

- A livello microscopico il gas è fatto di moltissime molecole in moto caotico.
- Ogni molecola urta contro le pareti esercitando una piccola **spinta**.
- La **pressione** è la spinta totale per unità di area:

\\[
P = \\frac{F}{A}
\\]

In questo modello supponiamo che esista una vera pressione media \\(P_{\\text{vera}}\\)
e che il nostro sensore fornisca misure rumorose intorno a quel valore.
Vogliamo stimare \\(P_{\\text{vera}}\\) e costruire un **intervallo di confidenza**.
"""
)

st.sidebar.header("Parametri dell'esperimento")

# Slider e controlli nella sidebar
P_vera = st.sidebar.slider(
    "Vera pressione P_vera (atm)",
    min_value=0.8,
    max_value=1.2,
    value=1.0,
    step=0.01,
)

sigma = st.sidebar.slider(
    "Rumore del sensore σ (atm)",
    min_value=0.005,
    max_value=0.20,
    value=0.05,
    step=0.005,
)

n = st.sidebar.slider(
    "Numero di misure n",
    min_value=5,
    max_value=200,
    value=25,
    step=5,
)

confidenza = st.sidebar.selectbox(
    "Livello di confidenza",
    options=["90%", "95%", "99%"],
    index=1,
)

st.sidebar.markdown(
    """
Cambia i parametri e osserva come variano:

- la **media campionaria**,
- l'**errore standard**,
- l'ampiezza dell'**intervallo di confidenza**,
- la posizione della **vera pressione** rispetto all'intervallo.
"""
)

# Mappatura tra livello di confidenza e z-score approssimato
z_map = {
    "90%": 1.64,
    "95%": 1.96,
    "99%": 2.58,
}
z = z_map[confidenza]

# Simulazione delle misure (sensore rumoroso)
misure = np.random.normal(loc=P_vera, scale=sigma, size=n)

# Statistiche campionarie
media = misure.mean()
s = misure.std(ddof=1)   # deviazione standard campionaria
se = s / np.sqrt(n)      # errore standard della media

# Intervallo di confidenza
margine = z * se
ic_basso = media - margine
ic_alto = media + margine

st.header("Risultati dell'esperimento simulato")

col1, col2, col3 = st.columns(3)
col1.metric("Vera pressione P_vera (atm)", f"{P_vera:.3f}")
col2.metric("Media campionaria (atm)", f"{media:.3f}")
col3.metric("σ rumore sensore (atm)", f"{sigma:.3f}")

col4, col5, col6 = st.columns(3)
col4.metric("Dev. std. campionaria s (atm)", f"{s:.3f}")
col5.metric("Errore standard SE (atm)", f"{se:.3f}")
col6.metric(f"Ampiezza IC {confidenza}", f"{(ic_alto - ic_basso):.3f} atm")

st.markdown(
    f"""
**Intervallo di confidenza {confidenza} sulla media:**

\\[
[{ic_basso:.3f}\\ \\text{{atm}},\\ {ic_alto:.3f}\\ \\text{{atm}}]
\\]

La linea tratteggiata indica l'intervallo di confidenza per la media della pressione.
La linea tratto-punto indica la **vera** pressione \\(P_{{\\text{{vera}}}}\\).
"""
)

# Grafico: istogramma delle misure con linee verticali
fig, ax = plt.subplots(figsize=(8, 4))
bins = max(5, n // 5)
ax.hist(misure, bins=bins, alpha=0.7)
ax.axvline(media, linestyle='-', linewidth=2, label='Media campionaria')
ax.axvline(ic_basso, linestyle='--', linewidth=2, label='IC limite inferiore')
ax.axvline(ic_alto, linestyle='--', linewidth=2, label='IC limite superiore')
ax.axvline(P_vera, linestyle=':', linewidth=2, label='P_vera (vera pressione)')
ax.set_xlabel("Pressione misurata (atm)")
ax.set_ylabel("Frequenza")
ax.set_title("Misure di pressione del gas e intervallo di confidenza")
ax.legend()

st.pyplot(fig)

st.markdown(
    """
## Come usare questo esempio in classe

Alcune domande da porre agli studenti mentre modifichi i parametri:

1. Cosa succede all'ampiezza dell'intervallo di confidenza quando aumenti il numero di misure \\(n\\)?
2. Cosa succede quando aumenti il rumore del sensore \\(\\sigma\\)?
3. Perché l'intervallo di confidenza al 99% è più ampio di quello al 90%?
4. In che senso la “vera” pressione \\(P_{\\text{vera}}\\) è legata a una media su moltissime configurazioni microscopiche del gas?
5. L'intervallo di confidenza parla della **procedura statistica** o del **valore vero**?

Questo esempio mette in contatto:

- il livello **microscopico** (molecole in moto caotico),
- il livello **macroscopico** (pressione come grandezza emergente),
- e il livello **inferenziale** (stima e intervalli di confidenza).
"""
)
