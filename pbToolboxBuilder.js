const pbToolboxBuilder = {
  toolboxXmlFromBlockTypes(types, withCategories) {
    return this.toolboxXmlFromTree(this.toolboxTreeFromBlockTypes(types,withCategories))
  },
  toolboxXmlFromTree(bloques) {
    let toolbox = [];

    toolbox.push('<xml>');

    bloques.forEach((bloque) => {

      if (bloque.isSeparator) {
        toolbox.push('<sep></sep>');

      } else if (bloque.category) {

        if (bloque.custom) {
          toolbox.push(`<category name="${bloque.category}" custom="${bloque.custom}">`);
        } else {
          toolbox.push(`<category name="${bloque.category}">`);

          bloque.blocks.forEach((bloque_en_categoria) => {

            if (!Blockly.Blocks[bloque_en_categoria]) {
              throw new Error(`This block named '${bloque_en_categoria}' don't exist.`);
            }

            if(Blockly.Blocks[bloque_en_categoria].toolbox)
            {
              toolbox.push(Blockly.Blocks[bloque_en_categoria].toolbox);
            }
            else {
              toolbox.push(`  <block type="${bloque_en_categoria}"></block>`);
            }
          });
        }

        toolbox.push('</category>');

      } else {

        if (!Blockly.Blocks[bloque]) {
          throw new Error(`This block named '${bloque}' don't exist.`);
        }

        if (Blockly.Blocks[bloque].toolbox) {
          toolbox.push(Blockly.Blocks[bloque].toolbox);
        } else {
          toolbox.push(`  <block type="${bloque}"></block>`);
        }
      }
    });


    toolbox.push('</xml>');

    return toolbox.join("\n");
  },
  /**
   * Genera el toolbox como lista de categorias con bloques a partir
   * de una lista de bloques simples.
   *
   * Por ejemplo:
   *
   *  >> toolboxTreeFromBlockTypes(['MoverDerecha', 'TocaSensor', 'TocaEnemigo'])
   *
   * [
   *    {
   *      category: 'Primitivas',
   *      blocks: ['MoverDerecha']
   *    },
   *    {
   *      category: 'Sensores',
   *      blocks: ['TocaSensor', 'TocaEnemigo']
   *    },
   * ]
   *
   */
  toolboxTreeFromBlockTypes(bloques,conCategorias=true) {

    if (bloques === undefined) {
      throw new Error("La actividad no tiene bloques definidos, revise el fixture de la actividad para migrarla a ember-blocky.");
    }

    let toolbox = [];

    bloques.forEach((bloque) => {
      let bloqueDesdeBlockly = this._obtenerBloqueDesdeBlockly(bloque);

      if (bloqueDesdeBlockly && bloqueDesdeBlockly.categoria) {
        this._agregar_bloque_a_categoria(toolbox, bloqueDesdeBlockly.categoria, bloque, bloqueDesdeBlockly.categoria_custom);
      } else {
        this._agregar_bloque_a_categoria(toolbox, 'SIN CATEGORÍA', bloque);
      }

    });

    toolbox.push({ category: 'Separator', isSeparator: true });

    return this._aplicarEstiloAToolbox(this.ordenar_toolbox(toolbox),conCategorias);
  },

  /**
   * Dependiendo del desafío, puede pasar que sea necesario no mostrar las categorías
   * sino directamente los bloques en el toolbox.
   * 
   * TODO: Falta implementar el estilo "desplegado"
   */
  _aplicarEstiloAToolbox(toolbox,conCategorias) {
    var aplanado = toolbox;
    if (!conCategorias) {
      aplanado = [];
      toolbox.forEach(bloque => {
        if (bloque.isSeparator || !bloque.category) {
          aplanado.push(bloque); //un separador ó un id de bloque van directo
        } else {
          aplanado = aplanado.concat(this._aplicarEstiloAToolbox(bloque.blocks,conCategorias));
        }
      });
    }
    return aplanado;
  },

  /**
   * Ordena la lista de ítems de un toolbox (usualmente categorias), por el orden
   * establecido en Pilas Bloques. 
   * Las categorías que no están en la lista definida por Pilas Bloques, quedan al final.
   * @param {*} toolbox 
   */
  ordenar_toolbox(toolbox) {
    let orden_inicial = [ // Orden inicial para la lista de categorias.
      'Primitivas',
      'Mis procedimientos',
      'Repeticiones',
      'Alternativas',
      'Variables',
      'Separator',
      'Valores',
      'Sensores',
      'Operadores',
      'Mis funciones'
    ];

    return toolbox.sort((cat1, cat2) =>
      orden_inicial.indexOf(cat1.category) >= orden_inicial.indexOf(cat2.category)
    );
  },

  /**
   * Permite obtener el bloque desde blockly a partir de su nombre simple.
   *
   * TODO: Mover a ember-blockly. Debería estar dentro del servicio blockly.
   */
  _obtenerBloqueDesdeBlockly(bloqueComoString) {
    return Blockly.Blocks[bloqueComoString];
  },

  /**
   * Método auxiliar de "toolboxTreeFromBlockTypes". Este método
   * permite agregar un bloque a una categoría dentro del toolbox.
   */
  _agregar_bloque_a_categoria(toolbox, categoria, bloque, categoria_custom) {

    function obtenerOCrearCategoria(toolbox, categoria) {
      for (let i = 0; i < toolbox.length; i++) {
        if (toolbox[i].category === categoria) {
          return toolbox[i];
        }
      }

      toolbox.push({
        category: categoria,
        blocks: []
      });

      return toolbox[toolbox.length - 1];
    }

    let categoriaEnElToolbox = obtenerOCrearCategoria(toolbox, categoria);
    if (categoria_custom) {
      categoriaEnElToolbox.custom = categoria_custom;
    }
    categoriaEnElToolbox.blocks.push(bloque);
  }
}

export default pbToolboxBuilder;