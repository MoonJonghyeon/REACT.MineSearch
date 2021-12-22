import React, { useCallback, useEffect, useReducer, useState, createContext, useMemo } from 'react';
import Form from './Form'
import Table from './Table'

export const CODE = {
  MINE: -7,
  NORMAL: -1,
  QUESTION: -2,
  QUESTION_MINE: -4,
  FLAG: -3,
  FLAG_MINE: -5,
  CLICKED_MINE: -6,
  OPENED: 0
}

export const TableContext = createContext({
  tableData: [],
  halted: true,
  dispatch: () => {}
})

const initialState = {
  tableData: [],
  data: {
    row: 0,
    cell: 0,
    mine: 0
  },
  timer: 0,
  result: '',
  halted: true,
  openedCount: 0
}

const plantMine = (row, cell, mine) => {
  console.log(row, cell, mine);
  const candidate = Array(row * cell).fill().map((arr, i) => {
    return i
  })
  const shuffle = []
  while (candidate.length > row * cell - mine) {
    const chosen = candidate.splice(Math.floor(Math.random() * candidate.length), 1)[0]
    shuffle.push(chosen)
  }
  const data = [];
  for (let i = 0; i < row; i++) {
    const rowData = []
    data.push(rowData)
    for (let j = 0; j < cell; j++) {
      rowData.push(CODE.NORMAL)
    }
  }
  for (let k = 0; k < shuffle.length; k++) {
    const ver = Math.floor(shuffle[k]/cell)
    const hor = shuffle[k] % cell;
    data[ver][hor] = CODE.MINE
  }
  console.log(data)
  return data
} 

export const START_GAME = 'START_GAME'
export const OPEN_CELL = 'OPEN_CELL'
export const FLAG_CELL = 'FLAG_CELL'
export const QUESTION_CELL = 'QUESTION_CELL'
export const NORMALIZE_CELL = 'NORMALIZE_CELL'
export const CLICK_MINE = 'CLICK_MINE'
export const INCREMENT_TIMER = 'INCREMENT_TIMER'

const reducer = (state, action) => {
  switch (action.type) {
    case START_GAME:
      return {
        ...state,
        data: {
          row: action.row,
          cell: action.cell,
          mine: action.mine
        },
        openedCount: 0,
        tableData: plantMine(action.row, action.cell, action.mine),
        halted: false,
        timer: 0
      }
    case OPEN_CELL:
      const newTableData = [...state.tableData];
      newTableData.forEach((row, i) => {
        newTableData[i] = [...state.tableData[i]]
      })
      const checked = []
      let counted = 0
      const checkAround = (row, cell) => {
        if ([CODE.OPENED, CODE.FLAG_MINE, CODE.FLAG, CODE.QUESTION_MINE, CODE.QUESTION].includes(newTableData[row][cell])) { //닫힌 칸만 열기
          return;
        }
        if (row < 0 || row >= newTableData.length || cell < 0 || cell >= newTableData[0].length) { //상하좌우 칸이 아닌경우 필터링
          return;
        }
        if (checked.includes(row + ',' + cell)) { //한번 연칸 무시하기
          return;
        } else {
          checked.push(row + ',' + cell)
        }
        let around = []
        if (newTableData[row - 1]) {
          around = around.concat(
            newTableData[row - 1][cell - 1], 
            newTableData[row - 1][cell], 
            newTableData[row - 1][cell + 1]
          )
        }
        around = around.concat(
          newTableData[row][cell - 1], 
          newTableData[row][cell + 1], 
        )
        if (newTableData[row + 1]) {
          around = around.concat(
            newTableData[row + 1][cell - 1], 
            newTableData[row + 1][cell], 
            newTableData[row + 1][cell + 1]
          )
        }
        const count = around.filter((v) => [CODE.MINE, CODE.FLAG_MINE, CODE.QUESTION_MINE].includes(v)).length
        // console.log(around, count)
        if (count === 0) {
          const near = [];
          if (row - 1 > -1) {
            near.push([row - 1, cell - 1])
            near.push([row - 1, cell])
            near.push([row - 1, cell + 1])
          }
          near.push([row, cell - 1])
          near.push([row, cell + 1])
          if (row + 1 < newTableData.length) {
            near.push([row + 1, cell - 1])
            near.push([row + 1, cell])
            near.push([row + 1, cell + 1])
          }
          console.log(near)
          near.forEach((n) => {
            if (newTableData[n[0]][n[1]] !== CODE.OPENED) {
              checkAround(n[0], n[1])
            }
          })
        }
        if (newTableData[row][cell] == CODE.NORMAL) {
          counted += 1;
        }
        newTableData[row][cell] = count
      }
      checkAround(action.row, action.cell)
      let halted = false
      let result = ''
      if (state.data.row * state.data.cell - state.data.mine === state.openedCount + counted) {
        halted = true,
        result = '승리'
      }
      return {
        ...state,
        tableData: newTableData,
        openedCount: state.openedCount + counted,
        halted,
        result,
      }
    case CLICK_MINE:
      const newTableData1 = [...state.tableData];
      newTableData1[action.row] = [...state.tableData[action.row]];
      newTableData1[action.row][action.cell] = CODE.CLICKED_MINE
      return {
        ...state,
        tableData: newTableData1,
        halted: true
      }
    case FLAG_CELL:
      const newTableData2 = [...state.tableData];
      newTableData2[action.row] = [...state.tableData[action.row]];
      if (newTableData2[action.row][action.cell] === CODE.MINE) {
        newTableData2[action.row][action.cell] = CODE.FLAG_MINE
      } else {
        newTableData2[action.row][action.cell] = CODE.FLAG
      }
      return {
        ...state,
        tableData: newTableData2,
      }
      case QUESTION_CELL:
        const newTableData3 = [...state.tableData];
        newTableData3[action.row] = [...state.tableData[action.row]];
        if (newTableData3[action.row][action.cell] === CODE.FLAG_MINE) {
          newTableData3[action.row][action.cell] = CODE.QUESTION_MINE
        } else {
          newTableData3[action.row][action.cell] = CODE.QUESTION
        }
        return {
          ...state,
          tableData: newTableData3,
        } 
      case NORMALIZE_CELL:
        const newTableData4 = [...state.tableData];
        newTableData4[action.row] = [...state.tableData[action.row]];
        if (newTableData4[action.row][action.cell] === CODE.QUESTION_MINE) {
          newTableData4[action.row][action.cell] = CODE.MINE
        } else {
          newTableData4[action.row][action.cell] = CODE.NORMAL
        }
        return {
          ...state,
          tableData: newTableData4,
        }
      case INCREMENT_TIMER:
        return {
          ...state,
          timer: state.timer + 1
        }
    default:
      return state
  }
}

const MineSearch = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { tableData, halted, timer, result} = state

  const value = useMemo(() => ({
    tableData,
    dispatch,
    halted
  }), [tableData, halted])

  useEffect(() => {
    let time
    if (halted === false) {
      time = setInterval(() => {
        dispatch({type: INCREMENT_TIMER})
      }, 1000)
    }
    return () => {
      clearInterval(time)
    }
  }, [halted])

  return (
    <TableContext.Provider value={value}>
    <Form />
    <div>{timer}</div>
    <Table />
    <div>{result}</div>
    </TableContext.Provider>
  );
}

export default MineSearch;