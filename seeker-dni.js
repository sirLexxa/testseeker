const cheerio = require("cheerio");

const user = "level";
const pass = "BAUYH612";

async function seek(dni) {
  try {
    const startTime = new Date(); // Obtener el tiempo de inicio

    const response = await fetch(
      "http://198.100.155.3/seek/index.php?view=processlogin",
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "es,es-ES;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          authorization: `Basic ${btoa(user + ":" + pass)}`,
          "cache-control": "max-age=0",
          "content-type": "application/x-www-form-urlencoded",
          "upgrade-insecure-requests": "1",
        },
        referrer: "http://198.100.155.3/seek/index.php",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: "usuario=level&contrasena=BAUYH612",
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );

    const cookie = response.headers.get("set-cookie");

    const response1 = await fetch(
      `http://198.100.155.3/seek/index.php?view=mostrar&cod=${dni}`,
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "es,es-ES;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          authorization: "Basic bGV2ZWw6QkFVWUg2MTI=",
          "upgrade-insecure-requests": "1",
          cookie: cookie,
          Referer: "http://198.100.155.3/seek/index.php?view=home",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: null,
        method: "GET",
      }
    );

    // Después de obtener la respuesta HTML
    const data = await response1.text();

    // Luego, cargar el HTML en Cheerio
    const $ = cheerio.load(data);

    // Extraer información adicional directamente de la misma página
    const nombreCompleto = $(".boxname .name").text().trim();
    const nuDni = $(".boxname .dni").text().trim();

    if (!nombreCompleto) {
      return { Status: 200, Datos: "No se encontraron datos para el DNI" };
    }

    const fechaNacimiento = $('.txtinfo p:contains("Fecha de Nacimiento:")')
      .contents() // Obtener todos los nodos hijos, incluidos los nodos de texto
      .filter(function () {
        return this.nodeType === 3;
      }) // Filtrar solo los nodos de texto
      .eq(1) // Seleccionar el segundo nodo de texto, que es la fecha de nacimiento
      .text()
      .trim();
    const edad = $('.txtinfo p:contains("Edad :")')
      .text()
      .replace("Edad :", "")
      .trim();
    const sexo = $('.txtinfo p:contains("Sexo :")')
      .text()
      .replace("Sexo :", "")
      .trim();
    const estadoCivil = $('.txtinfo p:contains("Estado :")')
      .text()
      .replace("Estado :", "")
      .trim();
    const padre = $('.txtinfo p:contains("Padre :")')
      .text()
      .replace("Padre :", "")
      .trim();
    const madre = $('.txtinfo p:contains("Madre :")')
      .text()
      .replace("Madre :", "")
      .trim();
    const ubicacion = $('.txtinfo p:contains("Ubicación: ")')
      .text()
      .replace("Ubicación: ", "")
      .trim();
    const direccion = $('.txtinfo p:contains("Dirección: ")')
      .text()
      .replace("Dirección: ", "")
      .trim();
    const ubigeoNacimiento = $('.txtinfo p:contains("Ubigeo Nacimiento: ")')
      .text()
      .replace("Ubigeo Nacimiento: ", "")
      .trim();

    const datosPersona = {
      nombreCompleto,
      nuDni,
      fechaNacimiento,
      edad,
      sexo,
      estadoCivil,
      padre,
      madre,
      ubicacion,
      direccion,
      ubigeoNacimiento,
    };

    const table = $(
      'h3.titconsult.contenedor:contains("Listado de Numeros")'
    ).next();

    const headers = [];
    table.find("thead th").each(function (i, elem) {
      headers.push($(this).text());
    });

    const rowsTel = [];
    table.find("tbody tr").each(function (i, elem) {
      const row = {};
      $(this)
        .find("td")
        .each(function (j, elem) {
          row[headers[j].toLowerCase()] = $(this).text().toUpperCase();
        });
      const newRow = Object.assign({ id: `${dni}` }, row);
      delete newRow.activo;
      delete newRow["fec val"];
      rowsTel.push(newRow);
    });

    const table1 = $(
      'h3.titconsult.contenedor:contains("Listado de Trabajos")'
    ).next();

    const headers1 = [];
    table1.find("thead th").each(function (i, elem) {
      headers1.push($(this).text());
    });

    //CORREOS

    // Encontrar la tabla de correos
    const tablaCorreos = $('table.tablabox.rwd_auto:contains("Correo")');

    // Crear un array para almacenar los correos
    const correos = [];

    // Iterar sobre las filas de la tabla de correos
    tablaCorreos.find("tbody tr").each((_, row) => {
      const celdas = $(row).find("td");

      // Extraer valores de la fila
      const correo = celdas.eq(0).text().trim();
      const fecha = celdas.eq(1).text().trim();
      const fuente = celdas.eq(2).text().trim();

      // Crear un objeto para representar el correo actual
      const correoActual = {
        correo,
        fecha,
        fuente,
      };

      // Agregar el objeto al array de correos
      correos.push(correoActual);
    });

    const rowsTra = [];
    table1.find("tbody tr").each(function (i, elem) {
      const row1 = {};
      $(this)
        .find("td")
        .each(function (j, elem) {
          const key = headers1[j].toLowerCase();
          const value = $(this).text().toUpperCase();

          if (key === "denominación") {
            row1["nomEmpresa"] = value;
          } else if (key === "situación") {
            row1["estado"] = value;
          } else if (key === "variable") {
            row1["sueldo"] = value;
          } else {
            row1[key] = value;
          }
        });

      const newRow1 = Object.assign({ id: `${dni}` }, row1);
      rowsTra.push(newRow1);
    });

    const tablaDatos = $('table.tablabox.rwd_auto:contains("CODIGO SBS")');
    const tablaSbs = $('table.tablabox.rwd_auto:contains("SALDO")');

    const celdas = tablaDatos.find("tbody td");
    const celdasSbs = tablaSbs.find("tbody tr");

    const datosRiesgo = [];
    const reporteSbs = [];

    const claves = [
      "sbs",
      "feReport",
      "noEntidad",
      "ok",
      "cpp",
      "def",
      "dud",
      "per",
    ];

    const riesData = {};

    celdas.each(function (i, elem) {
      riesData[claves[i]] = $(this).text();
    });

    const newRies = Object.assign({ id: `${dni}` }, riesData);
    const fechaReporte = newRies.feReport;

    if (Object.keys(newRies).length > 1) {
      const fechaFormateada = `${fechaReporte.slice(6, 8)}/${fechaReporte.slice(
        4,
        6
      )}/${fechaReporte.slice(0, 4)}`;
      newRies.feReport = fechaFormateada;
      datosRiesgo.push(newRies);
    }

    const clavesSbs = ["entidad", "saldo", "clasificacion"];

    celdasSbs.each(function (_, fila) {
      const celdas = $(fila).find("td");
      const entidadData = {};

      for (let i = 0; i < 3; i++) {
        entidadData[clavesSbs[i]] = $(celdas[i]).text();
      }

      const newEntidad = Object.assign({ id: `${dni}` }, entidadData);
      reporteSbs.push(newEntidad);
    });

    const familiaDiv = $("#familia");
    const familiares = [];

    familiaDiv.find("tbody tr").each((index, row) => {
      const tds = $(row).find("td");
      const doc = tds.eq(0).text().trim();
      const apePaterno = tds.eq(1).text().trim();
      const apeMaterno = tds.eq(2).text().trim();
      const preNombres = tds.eq(3).text().trim();
      const feNacimiento = tds.eq(4).text().trim();
      const tipo = tds.eq(5).text().trim();

      const feNacimientoFormateada = feNacimiento
        ? `${feNacimiento.substring(8, 10)}/${feNacimiento.substring(
            5,
            7
          )}/${feNacimiento.substring(0, 4)}`
        : "";

      const familiar = {
        dni: doc,
        apePaterno,
        apeMaterno,
        preNombres,
        feNacimiento: feNacimientoFormateada,
        tipo,
      };

      const newRowf = Object.assign({ id: `${dni}` }, familiar);
      familiares.push(newRowf);
    });

    const endTime = new Date(); // Obtener el tiempo de finalización
    const tiempoConsulta = endTime - startTime; // Calcular la duración de la consulta en milisegundos

    const SeekerData = {
      telefonos: rowsTel,
      trabajos: rowsTra,
      sbs: { datosRiesgo, reporteSbs },
      familia: familiares,
      datosPersona,
      correos: { Estado: correos.length > 0, data: correos },
    };

    console.log(tiempoConsulta);

    // Crear un objeto para almacenar el estatus de cada array
    const arraysConEstatus = {
      datosPersona: {
        Estado: Object.keys(SeekerData.datosPersona).length > 0,
        data: SeekerData.datosPersona,
      },
      Telefonos: {
        Estado: SeekerData.telefonos.length > 0,
        data: SeekerData.telefonos,
      },
      Correos: {
        Estado: correos.length > 0,
        data: correos,
      },
      Trabajos: {
        Estado: SeekerData.trabajos.length > 0,
        data: SeekerData.trabajos,
      },
      SBS: {
        datosRiesgo: { Estado: datosRiesgo.length > 0, data: datosRiesgo },
        reporteSbs: { Estado: reporteSbs.length > 0, data: reporteSbs },
      },
      Familia: {
        Estado: SeekerData.familia.length > 0,
        data: SeekerData.familia,
      },
      Dev: "https://t.me/Prxpietario",
      timeWait: tiempoConsulta + " ms",
      Message: "La prueba gratuita finaliza el 19/01/2024",
    };

    // Comprobar si hay arrays vacíos y establecer el estatus correspondiente
    const estatusGeneral = Object.values(arraysConEstatus).every(
      (array) => !array.Estado
    );

    if (estatusGeneral) {
      return { Status: 200, SeekerData: arraysConEstatus };
    }
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: "Error en la consulta, si el error persigue...",
    };
  }
}

module.exports = {
  seek,
};
