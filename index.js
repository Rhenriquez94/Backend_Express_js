const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3001; 

app.use(cors()) ; 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.listen(PORT, () => {
  console.log(`¡Servidor encendido en el puerto ${PORT}!`);
});

// Ver listado de canciones
app.get('/repertorio', (req, res) => {
  try {
    const cancion = JSON.parse(fs.readFileSync('repertorio.json', 'utf8'));
    res.json(cancion);
  } catch (error) {
    res.status(500).send('Error al leer el archivo');
  }
});

// Agregar Cancion
app.post('/repertorio', (req, res) => {
  try {
    const cancion = req.body;

    if (!cancion.id || !cancion.cancion || !cancion.artista) {
      return res.status(400).send('Datos incompletos');
    }
    const repertorio = JSON.parse(fs.readFileSync('repertorio.json', 'utf8'));
    const cancionExistente = repertorio.find(p => p.id === cancion.id);
    if (cancionExistente) {
      return res.status(400).send('Canción ya existe.');
    }
    repertorio.push(cancion);
    fs.writeFileSync('repertorio.json', JSON.stringify(repertorio, null, 2));

    res.status(201).send('Cancion agregada con exito!');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error al procesar la solicitud');
  }
});


// Eliminar la canciones
app.delete('/repertorio/:id', (req, res) => {
  try {
    const { id } = req.params;
    const repertorio = JSON.parse(fs.readFileSync('repertorio.json', 'utf8'));

    const index = repertorio.findIndex(p => p.id == id);
    if (index === -1) {
      return res.status(404).send('Canción no encontrada en el repertorio.');
    }

    repertorio.splice(index, 1);
    fs.writeFileSync('repertorio.json', JSON.stringify(repertorio, null, 2));

    res.send('Cancion eliminada.');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error al procesar la solicitud');
  }
});


// Editar cancion segun se ID
app.put('/repertorio/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { cancion, artista } = req.body;

    if (!cancion || !artista) {
      return res.status(400).send('Faltan datos');
    }

    const repertorio = JSON.parse(fs.readFileSync('repertorio.json', 'utf8'));
    const index = repertorio.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
      return res.status(404).send('Canción no encontrada');
    }

    repertorio[index] = {
      ...repertorio[index],
      cancion: cancion,
      artista: artista
    };
    fs.writeFileSync('repertorio.json', JSON.stringify(repertorio, null, 2));

    res.send('Canción actualizada con éxito');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al actualizar la canción');
  }
});