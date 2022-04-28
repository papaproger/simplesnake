/************************************/
/*   "Simple Snake" by PapaProger   */
/*      version 1.0, 28.04.2022     */
/*        (timer never stops)       */
/************************************/

import { useState, useEffect } from 'react'
import './App.css'
import { Cell } from './Cell'

type MovementType = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | ''
const Direction = { 'UP': [-1, 0], 'DOWN': [1, 0], 'LEFT': [0, -1], 'RIGHT': [0, 1], '': [0, 0] }

// Операции с массивом пар [строка, столбец]
class Snake {

  cells: [number, number][] // y, x <=> row, column
  length: number
  direction: MovementType // текущее направление движения

  constructor() { this.cells = []; this.length = 0; this.direction = ''; }

  getHeadRowIndex(): number { return this.cells[0][0] }
  getHeadColumnIndex(): number { return this.cells[0][1] }
  getTailRowIndex(): number { return this.cells[this.cells.length - 1][0] }
  getTailColumnIndex(): number { return this.cells[this.cells.length - 1][1] }

  // добавляет головную клетку
  addCell(c: [number, number]): void {
    this.cells.unshift(c)
    this.length = this.cells.length
  }

  // возвращает следующую для головы клетку при движении в заданном направлении
  getForwardCell(d: MovementType): [number, number] {
    return [this.cells[0][0] + Direction[d][0], this.cells[0][1] + Direction[d][1]]
  }

  // (исходя из противоположности текущего и нового направлений движения, тут формально не нужно)
  protected canMove(d: MovementType): boolean {
    return this.cells.length > 0 &&
      (Direction[this.direction][0] + Direction[d][0] !== 0 || Direction[this.direction][1] + Direction[d][1] !== 0)
  }

  // змея шагает: добавляется новая голова, хвостовая ячейка сбрасывается
  step(d: MovementType): void {
    if (this.canMove(d)) {
      this.cells.unshift(this.getForwardCell(d))
      this.cells.pop(); /* отличие от eat() */
      this.direction = d
    }
  }

  // змея ест камень: добавляется новая голова, съевшая камень, а хвостовая ячейка остается на месте
  eat(d: MovementType): void {
    if (this.canMove(d)) {
      this.cells.unshift(this.getForwardCell(d))
      this.direction = d
    }
  }
}

// Работа всего приложения и базовые настройки
class GameArea {

  rowNumber: number
  columnNumber: number
  grid: number[][]
  snake: Snake
  direction: MovementType // "кликнутое" направление движения
  gap: number // интервал запуска перерисовки

  constructor(rowNumber: number, columnNumber: number, snake: Snake, direction: MovementType, gap: number) {
    this.rowNumber = rowNumber
    this.columnNumber = columnNumber
    this.grid = GameArea.getEmptyArray(rowNumber, columnNumber)
    this.snake = snake
    this.direction = direction // можно высчитывать исходя из начального положения головы (змеи)
    this.gap = gap

    this.snake.addCell([GameArea.getRandomValue(0, rowNumber - 1), GameArea.getRandomValue(0, columnNumber - 1)])
    this.grid[snake.getHeadRowIndex()][snake.getHeadColumnIndex()] = 1 /* 1 */
    this.setStone()
  }

  // возвращает случайное целое число в заданном диапазоне
  static getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // генерирует двухмерный массив, забитый нулями
  static getEmptyArray(rowNumber: number, columnNumber: number): number[][] {

    let masterArray = new Array<Array<number>>(rowNumber)
    let slaveArray = new Array<number>(columnNumber)

    for (let i = 0; i < rowNumber; i++) {
      for (let j = 0; j < columnNumber; j++) {
        slaveArray[j] = 0
      }
      masterArray[i] = [...slaveArray]
    }

    return masterArray
  }

  // устанавливает новый камень на игровое поле
  protected setStone(): void {

    let randomRow, randomColumn: number

    // плохо: в лоб, но машина считает очень бодро
    do {
      randomRow = GameArea.getRandomValue(0, this.rowNumber - 1)
      randomColumn = GameArea.getRandomValue(0, this.columnNumber - 1)
    }
    while(this.grid[randomRow][randomColumn] !== 0)

    this.grid[randomRow][randomColumn] = 2
  }

  // двигает змею
  moveSnake(d: MovementType): void {

    // проверка на выход за пределы игрового поля
    if (this.snake.getForwardCell(d)[0] >= 0 &&
      this.snake.getForwardCell(d)[0] < this.rowNumber &&
      this.snake.getForwardCell(d)[1] >= 0 &&
      this.snake.getForwardCell(d)[1] < this.columnNumber) {

      // где потенциально окажется голова змеи при шаге в заданном направлении:
      switch (this.grid[this.snake.getForwardCell(d)[0]][this.snake.getForwardCell(d)[1]]) {

        // пустая клетка
        case 0: {
          this.grid[this.snake.getTailRowIndex()][this.snake.getTailColumnIndex()] = 0
          this.snake.step(d)
          this.grid[this.snake.getHeadRowIndex()][this.snake.getHeadColumnIndex()] = 1 /* 1 */
          break
        }
        // клетка, занятая змеей
        case 1: break
        // камень
        case 2: {
          this.snake.eat(d)
          this.grid[this.snake.getHeadRowIndex()][this.snake.getHeadColumnIndex()] = 1 /* 1 */
          this.setStone()
          break
        }
      }
    }
  }
}

// Инициализация игрового процесса
let ga = new GameArea(10, 15, new Snake(), 'RIGHT', 500)

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

export default function App() {

  // храним только сетку, отвечающую за перерисовку
  let [grid, setGrid] = useState(ga.grid)

  // обработчик кликов // плохо
  function clickHandler(ri: number, ci: number): void {
    if (ga.direction === 'UP' || ga.direction === 'DOWN') {
      if (ci < ga.snake.getHeadColumnIndex()) ga.direction = 'LEFT'
      if (ci > ga.snake.getHeadColumnIndex()) ga.direction = 'RIGHT'
      return
    }
    if (ga.direction === 'LEFT' || ga.direction === 'RIGHT') {
      if (ri < ga.snake.getHeadRowIndex()) ga.direction = 'UP'
      if (ri > ga.snake.getHeadRowIndex()) ga.direction = 'DOWN'
      return
    }
  }

  //console.log('in App')
  useEffect(() => {
    let timeoutId = setTimeout(() => {
      ga.moveSnake(ga.direction)
      setGrid([...ga.grid])
      //console.log('move snake')
    }, ga.gap)
    return () => {
      clearTimeout(timeoutId)
      //console.log('clear timer')
    }
  })

  // отрисовка
  return (
    <div className='screen-area'>
      <div className='game-area'>
        {grid.map((e, rowIndex) =>
          <div key={`${rowIndex}`} className='row-wrapper'>{e.map((e, columnIndex) =>
            <Cell key={`${rowIndex}-${columnIndex}`} value={e}
            rowIndex={rowIndex} columnIndex={columnIndex} clickHandler={clickHandler} />)}
          </div>)}
      </div>
    </div>
  )
}