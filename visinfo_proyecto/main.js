const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");

const WIDTH_VIS_1 = 150;
const HEIGHT_VIS_1 = 400;

const WIDTH_VIS_2 = 700;
const HEIGHT_VIS_2 = 500;
const PADDING = 50

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);

d3.csv("regional_of.csv").then(function(data) {
  // Convierte los valores necesarios a números o tipos apropiados
  data.forEach(function(d) {
    d.region = +d.region;
    d.total_personas = +d.total_personas;
    d.total_monto = +d.total_monto;
    d.posicion = d.posicion, 10;  // Parsea la posición como un entero
    d.nombre = d.nombre;
  });

  console.log('Datos de regional.csv:', data);
  crearMapa(data);
});

function crearMapa(data) {
  
  let tooltip = d3.select("body").append("div")
    .style("opacity", 0)
    .style("width", 200)
    .style("height", 50)
    .style("pointer-events", "none")
    .style("background", "rgb(117, 168, 234)")
    .style("border-radius", "8px")
    .style("padding", "4px")
    .style("position", "absolute");


  const escalaColor = d3.scaleLog()
    .domain(d3.extent(data, d => d.total_personas))
    .range(["white", '#d9021f']);

  const escalaPosicion = d3.scaleLinear()
        .domain(d3.extent(data, d => d.posicion))
        .range([15, 190])

  function onClicked() {
    var clickedElement = d3.select(this);
    var rect = clickedElement.selectAll("rect")
    if (rect.classed("clicked")) {
      rect.attr("class","region unclicked");
      
    } else {
    
      rect.attr("class","region clicked")
    }
    var clickedElements = d3.selectAll('.clicked');
    var clickedData = clickedElements.data();
    var regionValues = clickedData.map(function(d) {
      return d.region;
    });
    console.log('voy a llamar a prepo')
    preprocesarComunas(regionValues)
  }
  

  SVG1.append('text')
  .attr('x', WIDTH_VIS_1/6-20)
  .attr('y', 15)
  .style("font-size", "12px") // Ajusta el tamaño de la fuente
  .style("font-family", "Arial, sans-serif") 
  .text("Arica y Parinacota")

  SVG1.append('text')
  .attr('x', WIDTH_VIS_1/6-20)
  .attr('y', 390)
  .style("font-size", "12px") // Ajusta el tamaño de la fuente
  .style("font-family", "Arial, sans-serif") 
  .text("Magallanes y Antartida")
    
  SVG1.selectAll("g")
  .data(data, d => d.region)
  .join(
    enter => {
      const G = enter.append("g");

      G.append("rect")
        .attr("class", "region unclicked")
        .attr("id", d => d.nombre)
        .attr('x', 20)
        .attr('y', 10)
        .attr('width', 20)
        .attr('height', 20)
        .attr('stroke', '#7a7a7a')
        .attr('fill', d => escalaColor(d.total_personas));

      G.on("mouseover", (event, d) => {
        tooltip
            .html(`${d.nombre}<br>Total Personas: ${d.total_personas}<br>Total Monto: $${d.total_monto}<br>`)
            .style("opacity", 1)
            .style("background", escalaColor(d.total_personas))
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 28) + "px");
        const gElements = SVG1.selectAll("g");
        gElements.attr("opacity", 0.2);
        d3.select(event.currentTarget).attr("opacity", 1);


      }).on("mouseout", (event, d) => {
          tooltip.style("opacity", 0);
          const gElements = SVG1.selectAll("g");
          gElements.attr("opacity", 1);
      })

      G.on("click", onClicked)

      G.attr("transform", (d, i) => {
        const y = escalaPosicion(d.posicion);
        const x = WIDTH_VIS_1/6;
        return `translate(${x}, ${y})`;
      })
      return G
    })
          


};

function crearComunas(dataset, regiones){

  console.log('regiones en crear:',regiones)

  let datas = dataset.filter(function(d) {
    return regiones.includes(d.region) && d.total_personas !== 0;
    
  });

  console.log('hola datas', datas)
  const datos = datas.sort((a, b) => b.total_personas - a.total_personas).slice(0, 20)
  console.log('hola datos', datos)

  let tooltip = d3.select("body").append("div")
    .style("opacity", 0)
    .style("width", 200)
    .style("height", 50)
    .style("pointer-events", "none")
    .style("background", "rgb(117, 168, 234)")
    .style("border-radius", "8px")
    .style("padding", "4px")
    .style("position", "absolute");

  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(datos, d => d.total_personas)])
    .range([0, 60]);

    const coloresPersonalizados = [
      "#FF5733",
      "#FFD133",
      "#336BFF",
      "#FF33E9",
      "#33FFD1",
      "#FF336B",
      "#D133FF",
      "#57FF33",
      "#33C1FF",
      "#FF3333",
      "#33FFB5",
      "#FFAB33",
      "#333BFF",
      "#CD7F32",
      "#BDFF33",
      "#33FF57"
    ];
    


  var colorScale = d3.scaleOrdinal()
    .domain(Object.keys(coloresPersonalizados))
    .range(Object.values(coloresPersonalizados));

  
  // Create a force simulation
  var simulation = d3.forceSimulation(datos)
    .force("x", d3.forceX((WIDTH_VIS_2) / 2).strength(0.05))
    .force("y", d3.forceY((HEIGHT_VIS_2) / 3).strength(0.05))
    .force("collide", d3.forceCollide(d => radiusScale(d.total_personas) + 2))
    .on("tick", ticked);

  function ticked() {
    var bubbles = SVG2.selectAll(".comuna")
    bubbles.attr("cx", function(d) {
          return d.x -40|| 0; // Use 0 if d.x is undefined
        })
        .attr("cy", function(d) {
          return d.y +80 || 0; // Use 0 if d.y is undefined
        });
    }


  SVG2.selectAll("g")
  .data(datos, d => d.comuna)
  .join(
    enter => {
      const G = enter.append("g");
      G.append("circle")
        .attr("class","comuna")
        .attr("r", d => radiusScale(d.total_personas))
        .attr("fill", d => colorScale(String(d.region)))
        .attr("opacity", 0.8) // Adjust opacity as needed
        .on("mouseover", function(event, d) {
            tooltip.transition()
              .duration(200)
              .style("background", colorScale(String(d.region)))
              .style("opacity", .9);
            tooltip.html(`${d.region}<br>${d.comuna}<br>Total Personas: ${d.total_personas}<br>Total Monto: $${d.total_monto}`)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
            })
        .on("mouseout", function(event, d) {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
        });

        

          

        G.transition("entrar")
          .duration(500)
          .attr("r", d => radiusScale(d.total_personas)) 
          .attr("opacity", 1);
      return G
    },
    update => {
      update.selectAll("circle")
      .transition()
      .duration(500)
      .attr("r", d => radiusScale(d.total_personas));
      return update
    },
    exit => {
      exit.selectAll("circle")
      .transition()
      .duration(1000)
      .attr("r", 0) // Cambia el radio a 0 durante la transición
      .attr("opacity", 0) // Puedes ajustar la opacidad según tus preferencias
  
      exit.transition("adios").delay(1000).remove()

      return exit
    }
  )
  
  var puntos = SVG2.selectAll("circle");
  console.log(puntos)
  const manejadorZoom = (evento) => {
    const transformacion = evento.transform;
    // Actualizamos posición y tamaño usando transform
    puntos.transition().duration(200).attr("transform", transformacion);
  };

  // Creamos objeto zoom
  // Definimos los rangos de escalas (máximo alejarse 0.5 y acercarse el doble)
  // El evento principal (zoom) la conectamos con nuestra función que actualiza la vis.

  // Panning. Definimos el tamaño de nuestra cámara (con extent)
  // Definimos el cuadro máximo donde se puede mover nuestra cámara (con translateExtent)
  // Recomendación: extent == translateExtent == tamaño svg
  const zoom = d3.zoom()
    .scaleExtent([0.5, 2])
    .extent([[0, 0], [WIDTH_VIS_2, HEIGHT_VIS_2]])
    .translateExtent([[0, 0], [WIDTH_VIS_2, HEIGHT_VIS_2]])
    .on("start", () => console.log("Empecé"))
    .on("zoom", manejadorZoom)
    .on("end", () => console.log("Terminé"));

  // Conectamos el objeto zoom con el SVG para que se encargue de definir
  // todos los eventos necesarios para que funcione el zoom.
  SVG2.call(zoom);
};
