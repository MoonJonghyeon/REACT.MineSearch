import React, {useCallback, useState, useContext, memo} from 'react'
import { TableContext } from './MineSearch'
import { START_GAME } from './MineSearch'

const Form = memo(() => {
  const [row, setRow] = useState(10)
  const [cell, setCell] = useState(10)
  const [mine, setMine] = useState(20)
  const { dispatch } = useContext(TableContext)

  const onChangeRow = useCallback((e) => {
    setRow(e.target.value)
  }, [row])

  const onChangeCell = useCallback((e) => {
    setCell(e.target.value)
  }, [cell])

  const onChangeMine = useCallback((e) => {
    setMine(e.target.value)
  }, [mine])

  const onClickBtn = useCallback(() => {
    dispatch({ type: START_GAME, row, cell, mine })
  }, [row, cell, mine])

  return (
    <>
    <div>
      <input type="number" placeholder='세로' value={row} onChange={onChangeRow} />
      <input type="number" placeholder='가로' value={cell} onChange={onChangeCell} />
      <input type="number" placeholder='지뢰' value={mine} onChange={onChangeMine} />
      <button onClick={onClickBtn}>start</button>
    </div>
    </>
  )
})

export default Form;