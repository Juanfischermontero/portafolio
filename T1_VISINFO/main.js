const DATABASE_1910 = "https://gist.githubusercontent.com/Hernan4444/4d8ee655bdfe36bc682b009151f33156/raw/a7b6b28ea23091a077d49fa4b0cd37f983a7ff07/catholic_population_1910.json"
const DATABASE_2010 = "https://gist.githubusercontent.com/Hernan4444/4d8ee655bdfe36bc682b009151f33156/raw/a7b6b28ea23091a077d49fa4b0cd37f983a7ff07/catholic_population_2010.csv"

const WIDTH = 800;
const HEIGHT = 600;

const svg = d3.select("#vis")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);
const contenedor = svg
    .append("g")
    .attr("transform", `translate(${WIDTH} ${HEIGHT})`);
    // COMPLETAR CON CÓDIGO JS y D3.JS NECESARIO

function process_datos(datosJSON,datosCSV) {
    // Crear un mapa (objeto) a partir de los datos JSON para acceder más eficientemente por país
    const datosJSONMap = {};
    datosJSON.forEach(d => {
        datosJSONMap[d.id] = {
            name: d.name,
            population_1910: +d.population, // Convertir a número
            population_2010: 0 // Inicializar en cero
        };
    });

    // Combinar los datos del CSV con los datos JSON
    datosCSV.forEach(d => {
        const countryData = datosJSONMap[d.id];
        if (countryData) {
            countryData.population_2010 = +d.population; // Convertir a número
        }
    });

    // Convertir el mapa en un arreglo de objetos
    const combinedData = Object.values(datosJSONMap);

    return combinedData;
}

function createLines(data) {
    const lineGenerator = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveLinear);

    const linesData = data.map(d => {
        return [
            { x: 45, y: 570 - 8 * d.population_1910 },
            { x: 755, y: 570 - 8 * d.population_2010 }
        ];
    });

    svg.selectAll(".line")
        .data(linesData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", lineGenerator)
        .attr("stroke", "gray")
        .attr("fill", "none")
        .attr("stroke-width",4)
        .attr("id", (d, i) => `linea_${i}`);

    svg.select("#linea_0").attr("stroke", "red");
    svg.select("#linea_1").attr("stroke", "blue");
    svg.select("#linea_2").attr("stroke", "yellow");
    svg.select("#linea_3").attr("stroke", "violet");
    svg.select("#linea_4").attr("stroke", "green");
    svg.select("#linea_5").attr("stroke", "white");

    svg.selectAll('.line').on("mouseover", function () {
        d3.select(this).classed("hovered", true);
    })
    .on("mouseout", function () {
        d3.select(this).classed("hovered", false);
    });
}
    




function joinDeDatos(datos_csv,datos_json) {
    
    datos = process_datos(datos_json,datos_csv)
    
    const escalaY = d3
        .scaleLinear()
        .domain([0, 65])
        .range([520, 0]);

    
      // Creamos un eje izquierdo con D3 y le damos nuestra escala línea
      // para que sepa qué valores incluir en el eje.
    const ejeY = d3.axisLeft(escalaY);
    const ejeY2 = d3.axisRight(escalaY);
    
      // Agregamos al SVG el eje. La función call se encarga de indicarle al
      // objeto ejeY a qué selección de la visualización debe vincular sus 
      // datos para agregar el eje.
    svg
        .append("g")
        .attr("transform", `translate(${760}, ${50})`)
        .call(ejeY2);

    svg
        .append("g")
        .attr("transform", `translate(${40}, ${50})`)
        .call(ejeY);


    svg.append("text")
        .attr("x", 40) // Centrar en el medio del SVG
        .attr("y", 40) // Ajustar la posición vertical
        .attr("text-anchor", "middle") // Alineación horizontal centrada
        .attr("fill", "black")
        .text("1910");
    
    svg.append("text")
        .attr("x", 760) // Centrar en el medio del SVG
        .attr("y", 40) // Ajustar la posición vertical
        .attr("text-anchor", "middle") // Alineación horizontal centrada
        .attr("fill", "black")
        .text("2010");

    const circles1910 = svg.selectAll(".circle-1910")
        .data(datos)
        .join("circle")
        .attr("fill", "blue")
        .attr("cx", 40)
        .attr("cy", (d) => 570 - 8 * d.population_1910)
        .attr("r", 7)
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .attr("class", d => `${d.name.toLowerCase().replaceAll(' ', '')}`)
        .attr("id", d => `${d.name.toLowerCase().replaceAll(' ', '')}1910`);
    const circles2010 = svg.selectAll(".circle-2010")
        .data(datos)
        .join("circle")
        .attr("fill", "blue")
        .attr("cx", 760)
        .attr("cy", (d) => 570 - 8 * d.population_2010)
        .attr("r", 7)
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .attr("class", d => `${d.name.toLowerCase().replaceAll(' ', '')}`)
        .attr("id", d => `${d.name.toLowerCase().replaceAll(' ', '')}2110`);

    createLines(datos);

    const europe = svg.selectAll(".europe")
        .attr("fill", "red");
    const northamerica = svg.selectAll(".northamerica")
        .attr("fill", "green");
    const asiapacific = svg.selectAll(".asia-pacific")
        .attr("fill", "violet");
    const subsa = svg.selectAll(".sub-saharanafrica")
        .attr("fill", "yellow");
    const middleeast = svg.selectAll(".middleeast-northafrica")
        .attr("fill", "white");
    const latin = svg.selectAll(".latinamerica/caribben")
        .attr("fill", "green");
        
    

    }






function runCode(){
    d3.csv(DATABASE_2010)
    .then((datosCSV) => {
        // Tenemos el primer dataset cargado con el nombre "datosCSV"
        d3.json(DATABASE_1910)
        .then((datosJSON) => {
            // Tenemos el segundo dataset cargados con el nombbre "datosJSON"
            joinDeDatos(datosCSV,datosJSON)
            console.log("datosCSV", datosCSV);
            console.log("datosJSON", datosJSON);
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error)); 
}

runCode();
