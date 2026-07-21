// location-data.ts
// Structure: Country → Departamento → Provincia → Distrito[]
// Add more countries by extending LOCATION_DATA.

export interface Provincia    { name: string; distritos: string[] }
export interface Departamento { name: string; provincias: Provincia[] }
export interface Country      { name: string; departamentos: Departamento[] }

export const LOCATION_DATA: Country[] = [
  {
    name: 'Perú',
    departamentos: [
      {
        name: 'Amazonas',
        provincias: [
          { name: 'Chachapoyas', distritos: ['Chachapoyas', 'Asunción', 'Balsas', 'Cheto', 'Chiliquín', 'Chuquibamba', 'Granada', 'Huancas', 'La Jalca', 'Leimebamba', 'Levanto', 'Magdalena', 'Mariscal Castilla', 'Molinopampa', 'Montevideo', 'Olleros', 'Quinjalca', 'San Francisco de Daguas', 'San Isidro de Maino', 'Soloco', 'Sonche'] },
          { name: 'Bagua', distritos: ['Aramango', 'Bagua', 'Copallin', 'El Cenepa', 'Imaza', 'La Peca'] },
          { name: 'Bongará', distritos: ['Corosha', 'Cuispes', 'Florida', 'Jumbilla', 'La Florida', 'Longar', 'Milpuc', 'Pipus', 'Recta', 'San Carlos', 'Shipasbamba', 'Valera', 'Yambrasbamba'] },
          { name: 'Condorcanqui', distritos: ['El Cenepa', 'Nieva', 'Río Santiago'] },
          { name: 'Luya', distritos: ['Camporredondo', 'Cocabamba', 'Colcamar', 'Conila', 'Inguilpata', 'Lamud', 'Longuita', 'Lonya Chico', 'Luya', 'Luya Viejo', 'María', 'Ocalli', 'Ocumal', 'Pisuquía', 'Providencia', 'San Cristóbal', 'San Francisco del Yeso', 'San Jerónimo', 'San Juan de Lopecancha', 'Santa Catalina', 'Santo Tomás', 'Tingo', 'Trita'] },
          { name: 'Rodríguez de Mendoza', distritos: ['Chirimoto', 'Cochamal', 'Huambo', 'Limabamba', 'Longar', 'Mariscal Benavides', 'Milpuc', 'Omia', 'San Nicolás', 'Santa Rosa', 'Totora', 'Vista Alegre'] },
          { name: 'Utcubamba', distritos: ['Bagua Grande', 'Cajaruro', 'Cumba', 'El Milagro', 'Jamalca', 'Lonya Grande', 'Yamon'] },
        ],
      },
      {
        name: 'Áncash',
        provincias: [
          { name: 'Huaraz', distritos: ['Cochabamba', 'Colcabamba', 'Huanchay', 'Huaraz', 'Independencia', 'Jangas', 'La Libertad', 'Llacllin', 'Olleros', 'Pampas Grande', 'Pampas Chico', 'Pira', 'Tarica'] },
          { name: 'Santa', distritos: ['Cáceres del Perú', 'Chimbote', 'Coishco', 'Macate', 'Moro', 'Nepeña', 'Nuevo Chimbote', 'Samanco', 'Santa'] },
          { name: 'Casma', distritos: ['Buenavista Alta', 'Casma', 'Comandante Noel', 'Yautan'] },
          { name: 'Huaraz', distritos: ['Huaraz', 'Independencia'] },
          { name: 'Carhuaz', distritos: ['Acopampa', 'Amashca', 'Anta', 'Ataquero', 'Carhuaz', 'Llanganuco', 'Marcará', 'Pariahuanca', 'San Miguel de Aco', 'Shilla', 'Tinco', 'Yungar'] },
          { name: 'Yungay', distritos: ['Cascapara', 'Mancos', 'Matacoto', 'Quillo', 'Ranrahirca', 'Shupluy', 'Yanama', 'Yungay'] },
        ],
      },
      {
        name: 'Apurímac',
        provincias: [
          { name: 'Abancay', distritos: ['Abancay', 'Circa', 'Curahuasi', 'Huanipaca', 'Lambrama', 'Pichirhua', 'San Pedro de Cachora', 'Tamburco'] },
          { name: 'Andahuaylas', distritos: ['Andahuaylas', 'Andarapa', 'Chiara', 'Huancarama', 'Huancaray', 'Huayana', 'Kaquiabamba', 'Kishuara', 'Pacobamba', 'Pacucha', 'Pampachiri', 'Pomacocha', 'San Antonio de Cachi', 'San Jerónimo', 'San Miguel de Chaccrampa', 'Santa María de Chicmo', 'Talavera', 'Tumay Huaraca', 'Turpo'] },
          { name: 'Chincheros', distritos: ['Anco-Huallo', 'Chincheros', 'Cocharcas', 'Huaccana', 'Ocobamba', 'Ongoy', 'Ranracancha', 'Uranmarca'] },
          { name: 'Cotabambas', distritos: ['Cotabambas', 'Coyllurqui', 'Haquira', 'Mara', 'Tambobamba'] },
        ],
      },
      {
        name: 'Arequipa',
        provincias: [
          { name: 'Arequipa', distritos: ['Alto Selva Alegre', 'Arequipa', 'Cayma', 'Cerro Colorado', 'Characato', 'Chiguata', 'Jacobo Hunter', 'José Luis Bustamante y Rivero', 'La Joya', 'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Paucarpata', 'Pocsi', 'Polobaya', 'Quequeña', 'Sabandía', 'Sachaca', 'San Juan de Siguas', 'San Juan de Tarucani', 'Santa Isabel de Siguas', 'Santa Rita de Siguas', 'Socabaya', 'Tiabaya', 'Uchumayo', 'Vitor', 'Yanahuara', 'Yarabamba', 'Yura'] },
          { name: 'Camaná', distritos: ['Camaná', 'José María Quimper', 'Mariano Nicolás Valcárcel', 'Mariscal Cáceres', 'Nicolás de Piérola', 'Ocoña', 'Quilca', 'Samuel Pastor'] },
          { name: 'Caravelí', distritos: ['Acarí', 'Atico', 'Atiquipa', 'Bella Unión', 'Cahuacho', 'Caravelí', 'Chaparra', 'Huanuhuanu', 'Jaqui', 'Lomas', 'Quicacha', 'Yauca'] },
          { name: 'Islay', distritos: ['Cocachacra', 'Dean Valdivia', 'El Fiscal', 'Islay', 'Mejía', 'Mollendo', 'Punta de Bombón'] },
          { name: 'Caylloma', distritos: ['Achoma', 'Cabanaconde', 'Callalli', 'Caylloma', 'Chivay', 'Coporaque', 'Huambo', 'Huanca', 'Ichupampa', 'Lari', 'Lluta', 'Maca', 'Madrigal', 'Majes', 'San Antonio de Chuca', 'Sibayo', 'Tapay', 'Tisco', 'Tuti', 'Yanque'] },
        ],
      },
      {
        name: 'Ayacucho',
        provincias: [
          { name: 'Huamanga', distritos: ['Acocro', 'Acos Vinchos', 'Andrés Avelino Cáceres Dorregaray', 'Ayacucho', 'Carmen Alto', 'Chiara', 'Jesús Nazareno', 'Llucanamarca', 'Ocros', 'Pacaycasa', 'Quinua', 'San José de Ticllas', 'San Juan Bautista', 'Santiago de Pischa', 'Socos', 'Tambillo', 'Vinchos'] },
          { name: 'Huanta', distritos: ['Ayahuanco', 'Canayre', 'Chaca', 'Huamanguilla', 'Huanta', 'Iguain', 'Llochegua', 'Luricocha', 'Pucará', 'Santillana', 'Sivia'] },
          { name: 'La Mar', distritos: ['Anco', 'Ayna', 'Chilcas', 'Chungui', 'Chistuas', 'Luis Carranza', 'Oronccoy', 'Samugari', 'San Miguel', 'Santa Rosa', 'Tambo'] },
          { name: 'Lucanas', distritos: ['Aucará', 'Cabana', 'Carmen Salcedo', 'Chaviña', 'Chipao', 'Huac-Huas', 'Laramate', 'Leoncio Prado', 'Llauta', 'Lucanas', 'Ocaña', 'Otoca', 'Puquio', 'Saisa', 'San Cristóbal', 'San Juan', 'San Pedro', 'San Pedro de Palco', 'Sancos', 'Santa Ana de Huaycahuacho', 'Santa Lucía'] },
        ],
      },
      {
        name: 'Cajamarca',
        provincias: [
          { name: 'Cajamarca', distritos: ['Asunción', 'Cajamarca', 'Chetilla', 'Cospan', 'Encañada', 'Jesús', 'Llacanora', 'Los Baños del Inca', 'Magdalena', 'Namora', 'San Juan'] },
          { name: 'Cajabamba', distritos: ['Cajabamba', 'Cachachi', 'Condebamba', 'Sitacocha'] },
          { name: 'Celendín', distritos: ['Chumuch', 'Celendín', 'Cortegana', 'Huasmin', 'Jorge Chávez', 'José Gálvez', 'Miguel Iglesias', 'Oxamarca', 'Sorochuco', 'Sucre', 'Utco'] },
          { name: 'Chota', distritos: ['Anguía', 'Chota', 'Chumuch', 'Cochabamba', 'Conchán', 'Huambos', 'Lajas', 'Llama', 'Miracosta', 'Paccha', 'Pion', 'Querocoto', 'San Juan de Licupis', 'Tacabamba', 'Tocmoche'] },
          { name: 'Jaén', distritos: ['Bellavista', 'Chontali', 'Colasay', 'Huabal', 'Jaén', 'Las Pirias', 'Pucará', 'Sallique', 'San Felipe', 'San José del Alto', 'Santa Rosa'] },
          { name: 'San Ignacio', distritos: ['Chirinos', 'Huarango', 'La Coipa', 'Namballe', 'San Ignacio', 'San José de Lourdes', 'Tabaconas'] },
        ],
      },
      {
        name: 'Callao',
        provincias: [
          { name: 'Callao', distritos: ['Bellavista', 'Callao', 'Carmen de la Legua Reynoso', 'La Perla', 'La Punta', 'Mi Perú', 'Ventanilla'] },
        ],
      },
      {
        name: 'Cusco',
        provincias: [
          { name: 'Cusco', distritos: ['Ccorca', 'Cusco', 'Poroy', 'San Jerónimo', 'San Sebastián', 'Santiago', 'Saylla', 'Wanchaq'] },
          { name: 'Anta', distritos: ['Anta', 'Ancahuasi', 'Cachimayo', 'Chinchaypujio', 'Guayllabamba', 'Huarocondo', 'Limatambo', 'Mollepata', 'Pucyura', 'Zurite'] },
          { name: 'Calca', distritos: ['Calca', 'Coya', 'Lamay', 'Lares', 'Pisac', 'San Salvador', 'Taray', 'Yanatile'] },
          { name: 'Canchis', distritos: ['Checacupe', 'Combapata', 'Marangani', 'Pitumarca', 'San Pablo', 'San Pedro', 'Sicuani', 'Tinta'] },
          { name: 'Urubamba', distritos: ['Chinchero', 'Huayllabamba', 'Machupicchu', 'Maras', 'Ollantaytambo', 'Urubamba', 'Yucay'] },
          { name: 'La Convención', distritos: ['Echarate', 'Huayopata', 'Inkawasi', 'Kimbiri', 'Maranura', 'Megantoni', 'Pichari', 'Quellouno', 'Quimbiri', 'Santa Ana', 'Santa Teresa', 'Vilcabamba', 'Villa Kintiarina', 'Villa Virgen'] },
          { name: 'Espinar', distritos: ['Alto Pichigua', 'Condoroma', 'Coporaque', 'Espinar', 'Ocoruro', 'Pallpata', 'Pichigua', 'Suyckutambo'] },
          { name: 'Paucartambo', distritos: ['Caicay', 'Challabamba', 'Colquepata', 'Huancarani', 'Kosñipata', 'Paucartambo'] },
        ],
      },
      {
        name: 'Huancavelica',
        provincias: [
          { name: 'Huancavelica', distritos: ['Acobambilla', 'Acoria', 'Conayca', 'Cuenca', 'Huachocolpa', 'Huancavelica', 'Huayllahuara', 'Izcuchaca', 'Laria', 'Manta', 'Mariscal Cáceres', 'Moya', 'Nuevo Occoro', 'Palca', 'Pilchaca', 'Vilca', 'Yauli', 'Ascensión'] },
          { name: 'Acobamba', distritos: ['Acobamba', 'Andabamba', 'Anta', 'Caja', 'Marcas', 'Paucara', 'Pomacocha', 'Rosario'] },
          { name: 'Tayacaja', distritos: ['Acraquia', 'Ahuaycha', 'Colcabamba', 'Daniel Hernández', 'Huachocolpa', 'Huaribamba', 'Ñahuimpuquio', 'Pampas', 'Pazos', 'Pichos', 'Quishuar', 'Salcahuasi', 'San Marcos de Rocchac', 'Surcubamba', 'Tintay Puncu', 'Quichuas', 'Andaymarca'] },
        ],
      },
      {
        name: 'Huánuco',
        provincias: [
          { name: 'Huánuco', distritos: ['Amarilis', 'Chinchao', 'Churubamba', 'Huánuco', 'Kichki', 'La Esperanza', 'Margos', 'Pillcomarca', 'Quisqui', 'San Francisco de Cayran', 'San Pedro de Chaulán', 'Santa María del Valle', 'Yarumayo'] },
          { name: 'Leoncio Prado', distritos: ['Daniel Alomía Robles', 'Hermilio Valdizán', 'José Crespo y Castillo', 'Luyando', 'Mariano Dámaso Beraún', 'Padre Felipe Luyando', 'Rupa-Rupa', 'Tingo María'] },
          { name: 'Ambo', distritos: ['Ambo', 'Cayna', 'Colpas', 'Conchamarca', 'Huácar', 'San Francisco', 'San Rafael', 'Tomay Kichwa'] },
        ],
      },
      {
        name: 'Ica',
        provincias: [
          { name: 'Ica', distritos: ['Ica', 'La Tinguiña', 'Los Aquijes', 'Ocucaje', 'Pachacútec', 'Parcona', 'Pueblo Nuevo', 'Salas', 'San José de Los Molinos', 'San Juan Bautista', 'Santiago', 'Subtanjalla', 'Tate', 'Yauca del Rosario'] },
          { name: 'Chincha', distritos: ['Alto Larán', 'Callango', 'Chavin', 'Chincha Alta', 'Chincha Baja', 'El Carmen', 'El Santo', 'Grocio Prado', 'Pueblo Nuevo', 'San Juan de Yanac', 'San Pedro de Huacarpana', 'Sunampe', 'Tambo de Mora'] },
          { name: 'Pisco', distritos: ['Huancano', 'Humay', 'Independencia', 'Paracas', 'Pisco', 'San Andrés', 'San Clemente', 'Túpac Amaru Inca'] },
          { name: 'Nasca', distritos: ['Changuillo', 'El Ingenio', 'Marcona', 'Nasca', 'Vista Alegre'] },
          { name: 'Palpa', distritos: ['Llipata', 'Palpa', 'Río Grande', 'Santa Cruz', 'Tibillo'] },
        ],
      },
      {
        name: 'Junín',
        provincias: [
          { name: 'Huancayo', distritos: ['Carhuacallanga', 'Chacapampa', 'Chicche', 'Chilca', 'Chongos Alto', 'Chupuro', 'Colca', 'Cullhuas', 'El Tambo', 'Huacrapuquio', 'Hualhuas', 'Huancayo', 'Huancan', 'Huasicancha', 'Huayucachi', 'Ingenio', 'Pariahuanca', 'Pilcomayo', 'Pucará', 'Quichuay', 'Quilcas', 'San Agustín', 'San Jerónimo de Tunán', 'Saño', 'Sapallanga', 'Sicaya', 'Santo Domingo de Acobamba', 'Viques'] },
          { name: 'Chanchamayo', distritos: ['Chanchamayo', 'Chorobamba', 'La Merced', 'Perené', 'Pichanaqui', 'San Luis de Shuaro', 'San Ramón', 'Vitoc'] },
          { name: 'Tarma', distritos: ['Acobamba', 'Huaricolca', 'Huasahuasi', 'La Unión', 'Palca', 'Palcamayo', 'San Pedro de Cajas', 'Tarma', 'Tapo'] },
          { name: 'Satipo', distritos: ['Coviriali', 'Llaylla', 'Mazamari', 'Pampa Hermosa', 'Pangoa', 'Río Negro', 'Río Tambo', 'San Martín de Pangoa', 'Satipo'] },
          { name: 'Concepción', distritos: ['Aco', 'Andamarca', 'Chambará', 'Cochas', 'Comas', 'Concepción', 'Heroínas Toledo', 'Manzanares', 'Mariscal Castilla', 'Matahuasi', 'Mito', 'Nueve de Julio', 'Orcotuna', 'San José de Quero', 'Santa Rosa de Ocopa'] },
        ],
      },
      {
        name: 'La Libertad',
        provincias: [
          { name: 'Trujillo', distritos: ['El Porvenir', 'Florencia de Mora', 'Huanchaco', 'La Esperanza', 'Laredo', 'Moche', 'Poroto', 'Salaverry', 'Simbal', 'Trujillo', 'Víctor Larco Herrera'] },
          { name: 'Ascope', distritos: ['Ascope', 'Casa Grande', 'Chicama', 'Chocope', 'Magdalena de Cao', 'Paiján', 'Rázuri', 'Santiago de Cao'] },
          { name: 'Chepén', distritos: ['Chepén', 'Pacanga', 'Pueblo Nuevo'] },
          { name: 'Pacasmayo', distritos: ['Guadalupe', 'Jequetepeque', 'Lucma', 'Pacasmayo', 'San Pedro de Lloc'] },
          { name: 'Sánchez Carrión', distritos: ['Chugay', 'Cochorco', 'Curgos', 'Huamachuco', 'Marcabal', 'Sarín', 'Sartimbamba'] },
          { name: 'Otuzco', distritos: ['Agallpampa', 'Charat', 'Huaranchal', 'La Cuesta', 'Mache', 'Otuzco', 'Paranday', 'Salpo', 'Sinsicap', 'Usquil'] },
          { name: 'Virú', distritos: ['Chao', 'Guadalupito', 'Virú'] },
          { name: 'Gran Chimú', distritos: ['Cascas', 'Compin', 'Lucma', 'Marmot'] },
        ],
      },
      {
        name: 'Lambayeque',
        provincias: [
          { name: 'Chiclayo', distritos: ['Cayaltí', 'Chiclayo', 'Chongoyape', 'Eten', 'Eten Puerto', 'José Leonardo Ortiz', 'La Victoria', 'Lagunas', 'Monsefú', 'Nueva Arica', 'Oyotún', 'Picsi', 'Pimentel', 'Reque', 'Saña', 'Santa Rosa', 'Tumán'] },
          { name: 'Ferreñafe', distritos: ['Cañaris', 'Ferreñafe', 'Incahuasi', 'Manuel Mesones Muro', 'Mesones Muro', 'Pueblo Nuevo'] },
          { name: 'Lambayeque', distritos: ['Chóchope', 'Illimo', 'Jayanca', 'Lambayeque', 'Mochumi', 'Mórrope', 'Motupe', 'Olmos', 'Pacora', 'Salas', 'San José', 'Túcume'] },
        ],
      },
      {
        name: 'Lima',
        provincias: [
          {
            name: 'Lima',
            distritos: [
              'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo',
              'Chorrillos', 'Cieneguilla', 'Comas', 'El Agustino', 'Independencia',
              'Jesús María', 'La Molina', 'La Victoria', 'Lima', 'Lince', 'Los Olivos',
              'Lurigancho', 'Lurín', 'Magdalena del Mar', 'Miraflores', 'Pachacámac',
              'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa', 'Punta Negra',
              'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho',
              'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel',
              'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco',
              'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo',
            ],
          },
          { name: 'Barranca', distritos: ['Barranca', 'Ocros', 'Paramonga', 'Pativilca', 'Supe', 'Supe Puerto'] },
          { name: 'Cajatambo', distritos: ['Cajatambo', 'Copa', 'Gorgor', 'Huancapon', 'Manas'] },
          { name: 'Canta', distritos: ['Arahuay', 'Canta', 'Huamantanga', 'Huaros', 'Lachaqui', 'San Buenaventura', 'Santa Rosa de Quives'] },
          { name: 'Cañete', distritos: ['Asia', 'Calango', 'Cerro Azul', 'Chilca', 'Coayllo', 'Imperial', 'Lunahuaná', 'Mala', 'Nuevo Imperial', 'Quilmaná', 'San Antonio', 'San Luis', 'San Vicente de Cañete', 'Santa Cruz de Flores', 'Zúñiga'] },
          { name: 'Huaral', distritos: ['Atavillos Alto', 'Atavillos Bajo', 'Aucallama', 'Chancay', 'Huaral', 'Ihuarí', 'Lampián', 'Pacaraos', 'San Miguel de Acos', 'Santa Cruz de Andamarca', 'Sumbilca', 'Veintisiete de Noviembre'] },
          { name: 'Huarochirí', distritos: ['Antioquia', 'Callahuanca', 'Carampoma', 'Chicla', 'Cuenca', 'Huachupampa', 'Huanza', 'Huarochirí', 'Lahuaytambo', 'Langa', 'Laraos', 'Mariatana', 'Ricardo Palma', 'San Andrés de Tupicocha', 'San Antonio', 'San Damián', 'San Juan de Iris', 'San Juan de Tantaranche', 'San Lorenzo de Quinti', 'San Mateo', 'San Mateo de Otao', 'San Pedro de Casta', 'San Pedro de Huancayre', 'Sangallaya', 'Santa Cruz de Cocachacra', 'Santa Eulalia', 'Santiago de Anchucaya', 'Santiago de Tuna', 'Santo Domingo de Los Olleros', 'Surco'] },
          { name: 'Huaura', distritos: ['Ambar', 'Caleta de Carquín', 'Checras', 'Huacho', 'Hualmay', 'Huaura', 'Leoncio Prado', 'Paccho', 'Santa Leonor', 'Santa María', 'Sayán', 'Vegueta'] },
          { name: 'Oyón', distritos: ['Andajes', 'Caujul', 'Cochamarca', 'Naván', 'Oyón', 'Pachangara'] },
          { name: 'Yauyos', distritos: ['Alis', 'Allauca', 'Ayavirí', 'Azángaro', 'Cacra', 'Carania', 'Catahuasi', 'Chocos', 'Chusis', 'Colonia', 'Hongos', 'Huampará', 'Huancaya', 'Huangáscar', 'Huantán', 'Huañec', 'Laraos', 'Lincha', 'Madean', 'Miraflores', 'Omas', 'Putinza', 'Quinches', 'Quinocay', 'San Joaquín', 'San Pedro de Pilas', 'Tanta', 'Tauripampa', 'Tomas', 'Tupe', 'Viñac', 'Vitis', 'Yauyos'] },
        ],
      },
      {
        name: 'Loreto',
        provincias: [
          { name: 'Maynas', distritos: ['Alto Nanay', 'Belén', 'Fernando Lores', 'Indiana', 'Iquitos', 'Las Amazonas', 'Mazan', 'Napo', 'Punchana', 'Putumayo', 'San Juan Bautista', 'Torres Causana', 'Yaguasyacu'] },
          { name: 'Alto Amazonas', distritos: ['Balsapuerto', 'Barranca', 'Cahuapanas', 'Jeberos', 'Lagunas', 'Santa Cruz', 'Teniente César López Rojas', 'Yurimaguas'] },
          { name: 'Ucayali', distritos: ['Contamana', 'Inahuaya', 'Padre Márquez', 'Pampa Hermosa', 'Sarayacu', 'Vargas Guerra'] },
          { name: 'Requena', distritos: ['Alto Tapiche', 'Capelo', 'Emilio San Martín', 'Maquia', 'Puinahua', 'Requena', 'Saquena', 'Soplin', 'Tapiche', 'Yaquerana'] },
        ],
      },
      {
        name: 'Madre de Dios',
        provincias: [
          { name: 'Tambopata', distritos: ['Inambari', 'Laberinto', 'Las Piedras', 'Tambopata'] },
          { name: 'Manu', distritos: ['Fitzcarrald', 'Huepetuhe', 'Madre de Dios', 'Manu'] },
          { name: 'Tahuamanu', distritos: ['Iberia', 'Iñapari', 'Tahuamanu'] },
        ],
      },
      {
        name: 'Moquegua',
        provincias: [
          { name: 'Mariscal Nieto', distritos: ['Carumas', 'Cuchumbaya', 'Moquegua', 'Samegua', 'San Cristóbal', 'Torata'] },
          { name: 'General Sánchez Cerro', distritos: ['Chojata', 'Coalaque', 'Ichuña', 'La Capilla', 'Lloque', 'Matalaque', 'Omate', 'Puquina', 'Quinistaquillas', 'Ubinas', 'Yunga'] },
          { name: 'Ilo', distritos: ['El Algarrobal', 'Ilo', 'Pacocha'] },
        ],
      },
      {
        name: 'Pasco',
        provincias: [
          { name: 'Pasco', distritos: ['Chaupimarca', 'Huachón', 'Huariaca', 'Huayllay', 'Ninacaca', 'Pallanchacra', 'Paucartambo', 'San Francisco de Asís de Yarusyacan', 'Santa Ana de Tusi', 'Simón Bolívar', 'Ticlacayán', 'Tinyahuarco', 'Vicco', 'Yanacancha'] },
          { name: 'Daniel Alcides Carrión', distritos: ['Chacayán', 'Goyllarisquizga', 'Paucar', 'San Pedro de Pillao', 'Santa Ana de Tusi', 'Tapuc', 'Vilcabamba', 'Yanacocha', 'Yanahuanca'] },
          { name: 'Oxapampa', distritos: ['Chontabamba', 'Constitución', 'Huancabamba', 'Oxapampa', 'Palaz', 'Pozuzo', 'Puerto Bermúdez', 'Villa Rica'] },
        ],
      },
      {
        name: 'Piura',
        provincias: [
          { name: 'Piura', distritos: ['Castilla', 'Catacaos', 'Cura Morí', 'El Tallán', 'La Arena', 'La Unión', 'Las Lomas', 'Piura', 'Tambogrande', 'Veintiseis de Octubre'] },
          { name: 'Sullana', distritos: ['Bellavista', 'Ignacio Escudero', 'Lancones', 'Marcavelica', 'Miguel Checa', 'Querecotillo', 'Salitral', 'Sullana'] },
          { name: 'Talara', distritos: ['El Alto', 'La Brea', 'Lobitos', 'Los Órganos', 'Máncora', 'Pariñas'] },
          { name: 'Paita', distritos: ['Amotape', 'Arenal', 'Colan', 'La Huaca', 'Paita', 'Tamarindo', 'Vichayal'] },
          { name: 'Morropón', distritos: ['Buenos Aires', 'Chalaco', 'Chulucanas', 'La Matanza', 'Morropón', 'Salitral', 'San Juan de Bigote', 'Santa Catalina de Mossa', 'Santo Domingo', 'Yamango'] },
          { name: 'Huancabamba', distritos: ['Carmen de la Frontera', 'El Carmen de la Frontera', 'Huancabamba', 'Huarmaca', 'Lalaquiz', 'San Miguel del Faique', 'Sondor', 'Sondorillo'] },
          { name: 'Ayabaca', distritos: ['Ayabaca', 'Frías', 'Jilili', 'Lagunas', 'Montero', 'Pacaipampa', 'Paimas', 'Sapillica', 'Sicchez', 'Suyo'] },
          { name: 'Sechura', distritos: ['Bellavista de la Unión', 'Bernal', 'Cristo Nos Valga', 'Rinconada Llicuar', 'Sechura', 'Vice'] },
        ],
      },
      {
        name: 'Puno',
        provincias: [
          { name: 'Puno', distritos: ['Acora', 'Amantani', 'Atuncolla', 'Capachica', 'Chucuito', 'Coata', 'Huata', 'Mañazo', 'Paucarcolla', 'Pichacani', 'Platería', 'Puno', 'San Antonio', 'Tiquillaca', 'Vilque'] },
          { name: 'San Román', distritos: ['Cabana', 'Cabanillas', 'Caracoto', 'Juliaca', 'San Miguel'] },
          { name: 'Chucuito', distritos: ['Desaguadero', 'Huacullani', 'Juli', 'Kelluyo', 'Pisacoma', 'Pomata', 'Zepita'] },
          { name: 'El Collao', distritos: ['Capaso', 'Conduriri', 'Ilave', 'Pilcuyo', 'Santa Rosa'] },
          { name: 'Azángaro', distritos: ['Achaya', 'Arapa', 'Asillo', 'Azángaro', 'Caminaca', 'Chupa', 'José Domingo Choquehuanca', 'Muñani', 'Potoni', 'Saman', 'San Antón', 'San José', 'San Juan de Salinas', 'Santiago de Pupuja', 'Tirapata'] },
          { name: 'Melgar', distritos: ['Antauta', 'Ayaviri', 'Cupi', 'Llalli', 'Macari', 'Nuñoa', 'Orurillo', 'Santa Rosa', 'Umachiri'] },
          { name: 'Carabaya', distritos: ['Ajoyani', 'Ayapata', 'Coasa', 'Corani', 'Crucero', 'Ituata', 'Macusani', 'Usicayos'] },
        ],
      },
      {
        name: 'San Martín',
        provincias: [
          { name: 'San Martín', distritos: ['Alberto Leveau', 'Cacatachi', 'Chazuta', 'Chipurana', 'El Porvenir', 'Huimbayoc', 'Juan Guerra', 'La Banda de Shilcayo', 'Morales', 'Papaplaya', 'San Antonio', 'Sauce', 'Shapaja', 'Tarapoto'] },
          { name: 'Moyobamba', distritos: ['Calzada', 'Habana', 'Jepelacio', 'Moyobamba', 'Soritor', 'Yantalo'] },
          { name: 'Lamas', distritos: ['Alonso de Alvarado', 'Barranquita', 'Caynarachi', 'Cuñumbuqui', 'El Dorado', 'Lamas', 'Pinto Recodo', 'Rumisapa', 'San Roque de Cumbaza', 'Shanao', 'Tabalosos', 'Zapatero'] },
          { name: 'Rioja', distritos: ['Awajún', 'Elías Soplín Vargas', 'Moyobamba', 'Nueva Cajamarca', 'Pardo Miguel', 'Posic', 'Rioja', 'San Fernando', 'Yorongos', 'Yuracyacu'] },
          { name: 'Tocache', distritos: ['Campanilla', 'Pólvora', 'Shunte', 'Tocache', 'Uchiza'] },
        ],
      },
      {
        name: 'Tacna',
        provincias: [
          { name: 'Tacna', distritos: ['Alto de la Alianza', 'Calana', 'Ciudad Nueva', 'Inclán', 'Palca', 'Pocollay', 'Sama', 'Tacna'] },
          { name: 'Candarave', distritos: ['Cairani', 'Camilaca', 'Candarave', 'Curibaya', 'Huanuara', 'Quilahuani'] },
          { name: 'Jorge Basadre', distritos: ['Ilabaya', 'Ite', 'Locumba'] },
          { name: 'Tarata', distritos: ['Estique', 'Estique-Pampa', 'Héroes Albarracín', 'Susapaya', 'Tarata', 'Tarucachi', 'Ticaco'] },
        ],
      },
      {
        name: 'Tumbes',
        provincias: [
          { name: 'Tumbes', distritos: ['Corrales', 'La Cruz', 'Pampas de Hospital', 'San Jacinto', 'San Juan de la Virgen', 'Tumbes'] },
          { name: 'Contralmirante Villar', distritos: ['Casitas', 'Canoas de Punta Sal', 'Zorritos'] },
          { name: 'Zarumilla', distritos: ['Aguas Verdes', 'La Palma', 'Matapalo', 'Zarumilla'] },
        ],
      },
      {
        name: 'Ucayali',
        provincias: [
          { name: 'Coronel Portillo', distritos: ['Callería', 'Campo Verde', 'Iparía', 'Manantay', 'Masisea', 'Nueva Requena', 'Pucallpa', 'Yarinacocha'] },
          { name: 'Atalaya', distritos: ['Atalaya', 'Raymondi', 'Sepahua', 'Tahuanía', 'Yurúa'] },
          { name: 'Padre Abad', distritos: ['Alexander Von Humboldt', 'Aguaytía', 'Curimaná', 'Irazola', 'Neshuya', 'Von Humboldt'] },
          { name: 'Purús', distritos: ['Purús'] },
        ],
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getCountries(): string[] {
  return LOCATION_DATA.map(c => c.name);
}

export function getDepartamentos(country: string): string[] {
  return LOCATION_DATA.find(c => c.name === country)?.departamentos.map(d => d.name) ?? [];
}

export function getAllDistritos(country: string, departamento: string): string[] {
  const dept = LOCATION_DATA
    .find(c => c.name === country)
    ?.departamentos.find(d => d.name === departamento);
  if (!dept) return [];
  return [...new Set(dept.provincias.flatMap(p => p.distritos))].sort();
}

export function findProvincia(country: string, departamento: string, distrito: string): string {
  const dept = LOCATION_DATA
    .find(c => c.name === country)
    ?.departamentos.find(d => d.name === departamento);
  return dept?.provincias.find(p => p.distritos.includes(distrito))?.name ?? '';
}
