import React from 'react'
import { css } from '@emotion/css'

const loaderStyle = css`
    border: 12px solid #f3f3f3; /* Light grey */
    border-top: 12px solid gray; /* Blue */
    border-radius: 50%;
    width: 80px;
    height: 80px;
    animation: spin 2s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const Loader = () => {
    return (<div className='text-center'>
        <div className={loaderStyle}></div>
        <p className='mt-2'>Loading</p>
        </div>)
}

export default Loader