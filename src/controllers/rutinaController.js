const path = require("path");
const fs = require("fs");

// Tabla de mapeo de planes
const planMap = {
  // Masculino
  "Masculino|Perder grasa|Endomorfo|Principiante": {
    30: "Plan1.pdf",
    1: "Plan2.pdf",
    1.5: "Plan3.pdf",
    2: "Plan4.pdf",
  },
  "Masculino|Ganar masa muscular|Ectomorfo|Intermedio+": {
    30: "Plan5.pdf",
    1: "Plan6.pdf",
    1.5: "Plan7.pdf",
    2: "Plan8.pdf",
  },
  "Masculino|Ganar masa muscular|Endomorfo|Principiante": {
    30: "Plan21.pdf",
    1: "Plan22.pdf",
    1.5: "Plan23.pdf",
    2: "Plan24.pdf",
  },
  "Masculino|Ganar masa muscular|Endomorfo|Intermedio+": {
    30: "Plan25.pdf",
    1: "Plan26.pdf",
    1.5: "Plan27.pdf",
    2: "Plan28.pdf",
  },
  "Masculino|Ganar masa muscular|Ectomorfo|Principiante": {
    30: "Plan29.pdf",
    1: "Plan30.pdf",
    1.5: "Plan31.pdf",
    2: "Plan32.pdf",
  },
  "Masculino|Perder grasa|Endomorfo|Intermedio+": {
    30: "Plan33.pdf",
    1: "Plan34.pdf",
    1.5: "Plan35.pdf",
    2: "Plan36.pdf",
  },
  "Masculino|Perder grasa|Ectomorfo|Principiante": {
    30: "Plan37.pdf",
    1: "Plan38.pdf",
    1.5: "Plan39.pdf",
    2: "Plan40.pdf",
  },
  "Masculino|Perder grasa|Ectomorfo|Intermedio+": {
    30: "Plan41.pdf",
    1: "Plan42.pdf",
    1.5: "Plan43.pdf",
    2: "Plan44.pdf",
  },

  // Femenino
  "Femenino|Perder grasa|Endomorfo|Principiante": {
    30: "Plan9.pdf",
    1: "Plan10.pdf",
    1.5: "Plan11.pdf",
    2: "Plan12.pdf",
  },
  "Femenino|Ganar masa muscular|Ectomorfo|Principiante": {
    30: "Plan13.pdf",
    1: "Plan14.pdf",
    1.5: "Plan15.pdf",
    2: "Plan16.pdf",
  },
  "Femenino|Ganar masa muscular|Endomorfo|Principiante": {
    30: "Plan17.pdf",
    1: "Plan18.pdf",
    1.5: "Plan19.pdf",
    2: "Plan20.pdf",
  },
  "Femenino|Perder grasa|Endomorfo|Intermedio+": {
    30: "Plan45.pdf",
    1: "Plan46.pdf",
    1.5: "Plan47.pdf",
    2: "Plan48.pdf",
  },
  "Femenino|Perder grasa|Ectomorfo|Principiante": {
    30: "Plan49.pdf",
    1: "Plan50.pdf",
    1.5: "Plan51.pdf",
    2: "Plan52.pdf",
  },
  "Femenino|Perder grasa|Ectomorfo|Intermedio+": {
    30: "Plan53.pdf",
    1: "Plan54.pdf",
    1.5: "Plan55.pdf",
    2: "Plan56.pdf",
  },
  "Femenino|Ganar masa muscular|Ectomorfo|Intermedio+": {
    30: "Plan57.pdf",
    1: "Plan58.pdf",
    1.5: "Plan59.pdf",
    2: "Plan60.pdf",
  },
  "Femenino|Ganar masa muscular|Endomorfo|Intermedio+": {
    30: "Plan61.pdf",
    1: "Plan62.pdf",
    1.5: "Plan63.pdf",
    2: "Plan64.pdf",
  },
};

// Función que decide qué PDF retornar en base a los datos del cliente
function elegirPlan(data) {
  const { gender, goal, bodyType, experience, sessionTime } = data;

  // 🔧 Normalizar experiencia
  let exp = experience;
  if (
    experience === "Intermedio" ||
    experience === "Avanzado" ||
    experience === "Intermedio+"
  ) {
    exp = "Intermedio+";
  }

  // 🔧 Normalizar duración (regex para mayor precisión)
  const time = sessionTime.replace(/\s+/g, "").toLowerCase();
  let durationKey = null;

  if (/^30(min)?$/.test(time) || time.includes("30min")) durationKey = "30";
  else if (/1\.5h|1:30h|hora30|90min/.test(time)) durationKey = "1.5";
  else if (/^2(h|hora)?$/.test(time) || time.includes("120min"))
    durationKey = "2";
  else if (/^1(h|hora)?$/.test(time) || time.includes("60min"))
    durationKey = "1";

  const key = `${gender}|${goal}|${bodyType}|${exp}`;
  const planGroup = planMap[key];

  if (planGroup && durationKey && planGroup[durationKey]) {
    return planGroup[durationKey];
  }

  return "PlanDefault.pdf";
}
function calcularIMC(weight, height) {
  return weight / Math.pow(height / 100, 2);
}

exports.generateRoutinePdf = (req, res) => {
  try {
    const formData = req.body;
    console.log("📥 Datos recibidos del cliente:", formData);

    let { weight, height, goal, hasCondition, age, force } = formData;

    // Convertir a número
    weight = Number(weight);
    height = Number(height);
    age = Number(age);
    force = force === true || force === "true"; // por si viene string

    const imc = calcularIMC(weight, height);

    // 🚨 Validaciones críticas
    if (!force) {
      if (age < 16) {
        return res.status(400).json({
          warning: true,
          type: "Edad mínima",
          message:
            "Detectamos que tienes menos de 16 años. No recomendamos rutinas de este tipo sin supervisión médica especializada.",
        });
      }

      if (imc < 18.5 && goal === "Perder grasa") {
        return res.status(400).json({
          warning: true,
          type: "IMC Bajo",
          message:
            "Tu IMC es muy bajo y seleccionaste 'Perder grasa'. Esto puede ser riesgoso para tu salud. Consulta con un especialista antes de continuar.",
        });
      }

      if (imc > 35 && goal === "Ganar masa muscular") {
        return res.status(400).json({
          warning: true,
          type: "IMC Alto",
          message:
            "Tu IMC es muy alto. Recomendamos asesoría médica antes de enfocarte en ganar masa muscular.",
        });
      }

      if (hasCondition === "Sí") {
        return res.status(400).json({
          warning: true,
          type: "Condición médica",
          message:
            "Reportaste una condición o lesión. Es recomendable contar con la aprobación de un médico antes de seguir una rutina.",
        });
      }
    }

    // ✅ Si pasa validaciones o se fuerza, asignar plan normalmente
    const fileName = elegirPlan({ ...formData, weight, height, age });
    const filePath = path.join(__dirname, "..", "pdf", fileName);

    console.log(`📄 Se asignó el archivo: ${fileName}`);

    if (!fs.existsSync(filePath)) {
      console.error("❌ No existe el archivo:", filePath);
      return res.status(404).send("Archivo PDF no encontrado");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error("❌ Error al generar rutina:", err);
    res.status(500).send("Error interno al generar rutina");
  }
};

