const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");
const PLANETAS = "https://gist.githubusercontent.com/Hernan4444/c3c1951d161fec6eea6cc70c9b06b597/raw/aa18adad0e830ba422446411691bd148131c6c2a/planetas.json"

const CATEGORIAS_POR_PLANETA = {
    'Mercury': "DemoranPoco", 'Venus': "DemoranPoco", 'Earth': "DemoranPoco",
    'Mars': "DemoranPoco", 'Jupiter': "DemoranPoco", 'Saturn': "DemoranMucho",
    'Uranus': "DemoranMucho", 'Neptune': "DemoranMucho", 'Pluto': "DemoranMucho"
}

// Editar tamaños como estime conveniente
const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 400;

const WIDTH_VIS_2 = 1000;
const HEIGHT_VIS_2 = 920;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);



let datas;
d3.json(PLANETAS)
      .then((datos) => {
        datas = datos;
        console.log(datas)
        crearSistemaSolar(datas);
        
      })
      .catch((error) => console.log(error));

function blink(clase, event) {
  const claseSi = "." + clase;
  console.log("Class of the clicked element:", claseSi);
  const elementos = SVG1.selectAll(claseSi);
  
  const originalColors = elementos.nodes().map(element => element.getAttribute("fill"));
  console.log(originalColors);
  console.log(event)

  elementos
    .transition("blink")
    .duration(500)
    .attr("fill", "green")
    .transition("restoreColors") 
    .delay(200)
    .duration(500)
    .attr("fill", (d, i) => originalColors[i]);
  if (event.type !== "mouseover") {
    console.log("Event type is not mouseover");
    preprocesarSatelites(clase, false);   
  }
  }
      

function crearSistemaSolar(datas) {
    const data = datas.map(obj => {
        
        const newObj = { ...obj };
      
        
        newObj.radio = obj.diameter / 2;
      
        
        delete newObj.diameter;
      
        return newObj;
      });
    console.log(data)
    const temperatura_minima = d3.min(data, d => d.mean_temperature);
    const temperatura_maxima = d3.max(data, d => d.mean_temperature);

    // Definiremos un color distinto por planeta
    const escalaColor = d3.scaleDiverging(t => d3.interpolateRdBu(1 - t))
        .domain([temperatura_minima, 0, temperatura_maxima])

    const escalaRadio = d3.scaleLinear()
        .domain(d3.extent(data, d => d.radio))
        .range([10, 90])

    const escalaDistance = d3.scaleLog()
        .domain(d3.extent(data, d => d.distance_from_sun))
        .range([80, WIDTH_VIS_1-80])
    
   

    SVG1.selectAll("ellipse")
        .data(data, d => d.planet)
        .join(
            enter => {
                const orbit = enter.append("ellipse");
                orbit
                    .attr("cx",0)
                    .attr("cy",200)
                    .attr("rx",d => escalaDistance(d.distance_from_sun)+40)
                    .attr("ry",d => escalaDistance(d.distance_from_sun)/4)
                    .attr("fill","none")
                    .attr("opacity",0.3)
                    .attr("stroke", "white")
                    .attr("stroke-width", "1px");
                console.log(orbit)
                return orbit
            }
            
        )
    const arcos = d3.arc();
    
    const dString = arcos({
        innerRadius: 0,
        outerRadius: 80,
        startAngle: 0,
        endAngle: (Math.PI),
    })
    
    SVG1
    .append("path")
    .attr("d", dString)
    .attr("fill", "orange")
    .attr("transform", "translate(0, 200)");
    
    
    SVG1.selectAll("g")
    .data(data, d => d.planet)
    .join(
      enter => {
        const G = enter.append("g");

        G.append("circle")
          .attr("class", d => CATEGORIAS_POR_PLANETA[d.planet])
          .attr("cx", 40)
          .attr("cy", 40)
          .attr("fill", d => escalaColor(d.mean_temperature))
          .attr("r", d => escalaRadio(d.radio))
          .attr("clicked", false)
          .on("mouseover", showTag)
          .on("mouseout", hideTag)
          .on("click", function (event) {
            const elementClass = d3.select(this).attr("class");
            blink(elementClass, event);
          });
            

      
        G.append("text")
          .attr("x", 40)
          .attr("y", d => escalaRadio(d.radio)+ 70)
          .attr("text-anchor", "middle")
          .attr("fill", 'white')
          .text(d => d.planet);


        G.attr("transform", (d, i) => {
          const x = escalaDistance(d.distance_from_sun);
          const y = HEIGHT_VIS_1/2-40;
          return `translate(${x}, ${y})`;
        })
        return G
      }
      
    )
    function showTag(d) {
        console.log(d);
        let info = d.target.__data__
        let mensaje = `${info.planet}
        Distancia del sol: ${info.distance_from_sun}  
        Radio: ${info.radio}   
        Temperatura media: ${info.mean_temperature}`;
        console.log(mensaje);
        SVG1.append("text")
          .attr("class", "tag")
          .attr("x", 450)
          .attr("y", 50)
          .text(mensaje);

      }
      
      function hideTag() {
        SVG1.select(".tag").remove();
      }
    
    
    d3.json(PLANETAS).then(d => {
        console.log(d.map(e => e.planet))
    })

    /* 
    Cada vez que se haga click en un planeta. Debes llamar a
    preprocesarSatelites(categoria, false) donde "categoria" 
    el valor indicado en la constante CATEGORIAS_POR_PLANETA
    según el planeta seleccionado.
    Esta función se encargará de llamar a crearSatelites(...)
    */
}

function crearSatelites(dataset, categoria, filtrar_dataset, ordenar_dataset) {
    // 1. Actualizo nombre de un H4 para saber qué hacer con el dataset
    let texto = `Categoria: ${categoria} - Filtrar: ${filtrar_dataset} - Orden: ${ordenar_dataset}`
    d3.selectAll("#selected").text(texto)

    // 2. Nos quedamos con los satelites asociados a la categoría seleccionada
    console.log(categoria)
    let datos = dataset.filter(d => CATEGORIAS_POR_PLANETA[d.planet] == categoria)

    // 3. Filtrar, cuando corresponde, por magnitud
    // Completar aquí
    console.log(filtrar_dataset)
    if (filtrar_dataset){
      datos = datos.filter(d => d.radius > 100)
    }


    // 4. Quedarnos con solo 30 satelites. No editar esta línea
    datos = datos.slice(0, 30);
    console.log(datos)

    // 5. Ordenar, según corresponda, los 30 satelites. Completar aquí
    console.log(ordenar_dataset)
    if (ordenar_dataset == "alfabético"){
      datos.sort((a, b) => {
      
      return a.name.localeCompare(b.name);
      });
    } else if (ordenar_dataset == "albedo"){
      datos.sort((a, b) => {
        
        return a.albedo - b.albedo;
      });

    }



    // 6. Confeccionar la visualización
    let tooltip = d3.select("body").append("div")
    .style("opacity", 0)
    .style("width", 200)
    .style("height", 50)
    .style("pointer-events", "none")
    .style("background", "rgb(117, 168, 234)")
    .style("border-radius", "8px")
    .style("padding", "4px")
    .style("position", "absolute");

    const escalaColorCabeza = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.magnitude))
        .range(["white", "yellow"])

    const escalaTamanoCabeza = d3.scaleLog()
        .domain(d3.extent(dataset, d => d.radius))
        .range([10, 30])
    
    const escalaDistBrazos = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.albedo))
        .range([40, 100])
    
    const escalaColorResto = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(dataset.map(d => d.planet))
    
        SVG2.selectAll("g")
        .data(datos, d => d.name)
        .join(
          enter => {
            const G = enter.append("g");
    
            G.append("rect")
              .attr("class","tronco")
              .attr("x", 20)
              .attr("y", 50)
              .attr("width", 10)
              .attr("height", 70)
              .attr("fill", d => escalaColorResto(d.planet));
                
            G.append("circle")
              .attr("class","cabeza")
              .attr("cx", 25)
              .attr("cy", 40)
              .attr("fill", d => escalaColorCabeza(d.magnitude))
              .attr("r", d => escalaTamanoCabeza(d.radius));
            
              // Agregar texto
            G.append("text")
              .attr("x", 20)
              .attr("y", 0)
              .attr("text-anchor", "middle")
              .attr("fill", d => escalaColorResto(d.planet))
              .text(d => d.name);

            G.append("line")
              .attr("class", "brazo_der")
              .attr("x1", 25)
              .attr("y1",100)
              .attr("x2",  d => 25 + escalaDistBrazos(d.albedo))
              .attr("y2", 40)
              .attr("stroke", d => escalaColorResto(d.planet))
              .attr("stroke-width",5);

            G.append("line")
              .attr("class", "brazo_izq")
              .attr("x1", 25)
              .attr("y1",100)
              .attr("x2",  d => 25 - escalaDistBrazos(d.albedo))
              .attr("y2", 40)
              .attr("stroke", d => escalaColorResto(d.planet))
              .attr("stroke-width",5);
            
            G.append("circle")
              .attr("class","mano_der")
              .attr("cx", d => 25 + escalaDistBrazos(d.albedo))
              .attr("cy", 40)
              .attr("fill", d => escalaColorResto(d.planet))
              .attr("r", 10);  
            
            G.append("circle")
              .attr("class","mano_izq")
              .attr("cx", d => 25 - escalaDistBrazos(d.albedo))
              .attr("cy", 40)
              .attr("fill", d => escalaColorResto(d.planet))
              .attr("r", 10);
            
            
            G.on("mouseover", (event, d) => {
              tooltip
                  .html(`Nombre: ${d.name}<br>Planeta: ${d.planet}<br>magnitud: ${d.magnitude}<br>Albedo: ${d.albedo}<br>Radio: ${d.radius}<br>`)
                  .style("opacity", 1)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
              const gElements = SVG2.selectAll("g");
              gElements.attr("opacity", 0.5);
              d3.select(event.currentTarget).attr("opacity", 1);


          }).on("mouseout", (event, d) => {
              tooltip.style("opacity", 0);
              const gElements = SVG2.selectAll("g");
              gElements.attr("opacity", 1);
          })
            G.transition("entrar")
            .duration(1000)
            .attr("transform", (d, i) => {
                const row = Math.floor(i / 5); 
                const col = i % 5; 
                const x = col * 200 + 70; 
                const y = row * 150 + 30; 
                return `translate(${x}, ${y})`;
              });
            
            return G
          },
          update => {
            
          update.transition("nueva_posicion")
          .duration(1000)
          .attr("transform", (d, i) => {
              const row = Math.floor(i / 5); 
              const col = i % 5; 
              const x = col * 200 + 70; 
              const y = row * 150 + 30; 
              return `translate(${x}, ${y})`;
          });
            
            return update
          },
          exit => {
            exit.transition("exit")
            .duration(1000)
            .attr("transform", (d, i) => {
              const row = Math.floor(i / 5);
              const col = i % 5; 
              const x = col * 200 + 70; 
              const y = HEIGHT_VIS_2; 
              return `translate(${x}, ${y})`;
            });

            exit.transition("adios").delay(1000).remove()

            return exit
          }
        )
}
d3.select("#showCat1").on("mouseover", (event) => {blink("DemoranMucho",event);});
d3.select("#showCat2").on("mouseover", (event) => {blink("DemoranPoco",event);});
