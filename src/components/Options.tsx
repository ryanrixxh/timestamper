import '../styles/options.css'

function Options(props) {

    async function saveOption(event: any, name: string) {
        await props.store.set(name, { value: event.target.checked})
    }

    return (
        <div>
            <div className='heading'>Options</div>
            <div id='optionsBackdrop'>
                 <ul id='optionsList'>
                    <li className='option'>
                        <input className='optionToggle' 
                               onChange={(event) => saveOption(event, 'darkmode')} 
                               type="checkbox" 
                               name="darkmode" />
                        <p className='optionName'>Dark mode (available soon)</p>  
                    </li>
                    <li className='option'>
                        <input className='optionToggle' 
                               onChange={(event) => saveOption(event, 'localsave')} 
                               type="checkbox" 
                               name="localsave" />
                        <p>Save markers locally while online</p>
                    </li>
                 </ul>
            </div>
        </div>
    )
}

export default Options