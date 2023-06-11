import '../styles/options.css'

function Options(props) {
    return (
        <div>
            <div className='heading'>Options</div>

            <div id='optionsBackdrop'>
                 <ul id='optionsList'>
                    <li className='option'>
                        <input className='optionToggle' type="checkbox" name="darkmode" />
                        <p className='optionName'>Dark mode (available soon)</p>  
                    </li>
                    <li className='option'>
                        <input className='optionToggle' type="checkbox" name="localsave" />
                        <p>Save markers locally</p>
                    </li>
                 </ul>
            </div>
        </div>
    )
}

export default Options