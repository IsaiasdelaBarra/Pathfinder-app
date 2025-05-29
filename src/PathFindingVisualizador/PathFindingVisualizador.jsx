import React, { Component } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../Algoritmos/Dijkstra";
import "./PathFindingVisualizador.css";
import animationGif2 from "../Iconos/Tutorial-1.gif";
import animacionGif from "../Iconos/Animacion-1.gif";
import subgrafoDirigido from "../Iconos/subgrafo_dirigido.png";


const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      movingNodeType: null,
      speed: "normal",
      selectedAlgorithm: "dijkstra",
      tutorialStep: 0,
    };
    this.timeouts = [];
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid, tutorialStep: 1 }); // Muestra tutorial al iniciar
  }

  handleTutorial(action) {
    this.setState((prev) => {
      if (action === "next") return { tutorialStep: prev.tutorialStep + 1 };
      if (action === "prev") return { tutorialStep: prev.tutorialStep - 1 };
      if (action === "skip") return { tutorialStep: 0 };
      return {};
    });
  }

  handleMouseDown(row, col) {
    const node = this.state.grid[row][col];
    if (node.isStart) {
      this.setState({ mouseIsPressed: true, movingNodeType: "start" });
    } else if (node.isFinish) {
      this.setState({ mouseIsPressed: true, movingNodeType: "finish" });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleAlgorithmSelect(algo) {
    this.setState({ selectedAlgorithm: algo, showAlgorithmMenu: false });
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const { movingNodeType, grid } = this.state;

    if (movingNodeType === "start" || movingNodeType === "finish") {
      const newGrid = grid.map((rowArr) => rowArr.map((node) => ({ ...node })));
      for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < newGrid[0].length; c++) {
          if (movingNodeType === "start" && newGrid[r][c].isStart)
            newGrid[r][c].isStart = false;
          if (movingNodeType === "finish" && newGrid[r][c].isFinish)
            newGrid[r][c].isFinish = false;
        }
      }
      if (movingNodeType === "start") newGrid[row][col].isStart = true;
      if (movingNodeType === "finish") newGrid[row][col].isFinish = true;
      this.setState({ grid: newGrid });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
  }
  handleMouseUp() {
    this.setState({ mouseIsPressed: false, movingNodeType: null });
    /*this.setState({mouseIsPressed: false});*/
  }

  /*animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  } */ //animateDijkstra funcion vieja

  getAnimationSpeed() {
    switch (this.state.speed) {
      case "fast":
        return 5;
      case "slow":
        return 40;
      default:
        return 20; // normal
    }
  }

  clearAnimationTimeouts() {
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeouts = [];
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder, onFinish) {
    const speed = this.getAnimationSpeed();
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        const timeoutId = setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder, onFinish);
        }, speed * i);
        this.timeouts.push(timeoutId);
        return;
      }
      const timeoutId = setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, speed * i);
      this.timeouts.push(timeoutId);
    }
  }

  animateShortestPath(nodesInShortestPathOrder, onFinish) {
    const speed = this.getAnimationSpeed();
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const timeoutId = setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
        if (
          i === nodesInShortestPathOrder.length - 1 &&
          typeof onFinish === "function"
        ) {
          onFinish();
        }
      }, Math.max(20, speed * 2) * i);
      this.timeouts.push(timeoutId);
    }
  }
  visualizeDijkstra() {
    this.clearAnimationTimeouts();
    const { grid } = this.state;

    // Buscar la posición actual del nodo de inicio y fin
    let startNode, finishNode;
    for (let row of grid) {
      for (let node of row) {
        if (node.isStart) startNode = node;
        if (node.isFinish) finishNode = node;
      }
    }

    if (!startNode || !finishNode) return; // Seguridad

    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  clearBoard() {
    // Cancelar todos los timeouts pendientes
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeouts = [];

    const grid = getInitialGrid();
    this.setState({ grid });

    // Limpiar clases de nodos animados en el DOM
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 50; col++) {
        const node = document.getElementById(`node-${row}-${col}`);
        if (node) {
          node.className = "node";
          if (row === START_NODE_ROW && col === START_NODE_COL) {
            node.className += " node-start";
          }
          if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL) {
            node.className += " node-finish";
          }
        }
      }
    }
  }

  render() {
    const { grid, selectedAlgorithm, speed } = this.state;

    const { tutorialStep } = this.state;

    const tutorialContents = [
      null, // tutorialStep 0 = no mostrar
      <div>
        <h2>¡Bienvenido al Visualizador de Algoritmos!</h2>
        <img src={animationGif2} alt="Animación" />
        <p>
          Este tutorial te guiará por las funciones principales de la
          aplicación.
        </p>
      </div>,
      <div>
        <h2>Selecciona un Algoritmo</h2>
        <p>
          Usa el menú de la barra superior para elegir el algoritmo que deseas
          visualizar.
        </p>
        <img
          src={subgrafoDirigido}
          alt="Subgrafo dirigido"
          style={{ maxWidth: "100%", margin: "15px 0", borderRadius: "8px" }}
        />
        <div
          style={{
            marginTop: "10px",
            background: "#f0f4ff",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <strong>¿Qué es Dijkstra?</strong>
          <br />
          Dijkstra es un algoritmo que encuentra el camino más corto entre dos
          puntos en un grafo o red.
          <br />
          Funciona explorando los caminos posibles y eligiendo siempre el de
          menor costo hasta llegar al destino.
          <br />
          Es muy utilizado en mapas, GPS y redes para buscar rutas óptimas.
        </div>
      </div>,
      <div>
        <h2>¡Personaliza y Visualiza!</h2>
        <img src={animacionGif} alt="Animación" />
        <p>
          Puedes agregar paredes, mover los nodos de inicio/fin y ajustar la
          velocidad antes de presionar "Visualizar".
        </p>
      </div>,
    ];

    return (
      <>
        {tutorialStep > 0 && (
          <div className="tutorial-modal">
            <div className="tutorial-content">
              {tutorialContents[tutorialStep]}
              <div className="tutorial-buttons">
                <button
                  onClick={() => this.handleTutorial("prev")}
                  disabled={tutorialStep === 1}
                >
                  Atrás
                </button>
                {tutorialStep < 3 ? (
                  <button onClick={() => this.handleTutorial("next")}>
                    Siguiente
                  </button>
                ) : (
                  <button onClick={() => this.handleTutorial("skip")}>
                    Terminar
                  </button>
                )}
                <button onClick={() => this.handleTutorial("skip")}>
                  Saltar tutorial
                </button>
              </div>
            </div>
          </div>
        )}

        <nav className="navbar">
          <div className="navbar-left">
            <span className="navbar-title">
              Pathfinding: Visualizador de Algoritmos
            </span>
            <div className="navbar-options">
              <select
                className="visualize-btn"
                value={selectedAlgorithm}
                onChange={(e) =>
                  this.setState({ selectedAlgorithm: e.target.value })
                }
              >
                <option value="dijkstra">Dijkstra</option>
                {/* Agrega más algoritmos aquí */}
              </select>
              <select
                className="visualize-btn"
                value={speed}
                onChange={(e) => this.setState({ speed: e.target.value })}
              >
                <option value="fast">Rapido</option>
                <option value="normal">Normal</option>
                <option value="slow">Lento</option>
              </select>
            </div>
          </div>
        </nav>

        <div className="visualize-center">
          <button
            className="visualize-btn"
            onClick={() => this.visualizeDijkstra()}
          >
            Visualizar
          </button>
          <button
            className="visualize-btn"
            onClick={() => this.clearBoard()}
            style={{ marginLeft: "10px" }}
          >
            Limpiar tablero
          </button>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { col } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      row={rowIdx}
                      isFinish={node.isFinish}
                      isStart={node.isStart}
                      isWall={node.isWall}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
