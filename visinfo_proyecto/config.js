

let COMUNAS = [];
function preprocesarComunas(regiones) {
    
    if (COMUNAS.length == 0) {
        d3.csv("comunal_final.csv", function(d) {
            return {
              region: +d.region,
              comuna: d.comuna,
              total_personas: +d.total_personas,
              total_monto: +d.total_monto
            };
          }).then(function(data) {
            COMUNAS = data;

            preprocesarComunas(regiones);
          });
        
        return 0;
    }
    console.log('regiones en prepo:',regiones)
    // Generamos una copia del dataset
    let datos = COMUNAS.slice();

    crearComunas(datos, regiones);
}
