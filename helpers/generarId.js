const generarId = () => {
    const random = Math.random().toPrecision(32).substring(2);
    const fecha = Date.now().toString(32);
    return random + fecha;
}

export default generarId;