// The Snake's Cell

import React from 'react'
import logo1 from './logo1.svg'
import logo2 from './logo2.svg'

type PropsTipe = {
    value: number
    rowIndex: number
    columnIndex: number
    clickHandler: (ri: number, ci: number) => void
}

export const Cell = React.memo((props: PropsTipe) => {

    return (
        <div className='game-cell' onClick={() => props.clickHandler(props.rowIndex, props.columnIndex)}>
            {props.value === 1 ? (
                <div className='snake-cell'>
                    <img className='logo1' src={logo1} alt=''></img>
                </div>
            ) : props.value === 2 ? (
                <div className='stone'>
                    <img className='logo2' src={logo2} alt=''></img>
                </div>
            ) : ''}
        </div>
    )
})