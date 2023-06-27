import { useEffect, useState } from 'react'

import '../styles/options.css'

function Options(props) {
    const [ optionsLoaded, setOptionsLoaded ] = useState<boolean>(false)
    const [ isDark, setIsDark ] = useState<boolean>()
    const [ isLocallySaved, setIsLocallySaved ] = useState<boolean>() 

    async function loadOptions() {
        await props.store.entries().then((result) => {
            const map = new Map()
            result.forEach((option) => {
                map.set(option[0], option[1].value)
            })

            setIsDark(map.get('option-darkmode'))
            setIsLocallySaved(map.get('option-localsave'))

            setOptionsLoaded(true)
        })
    }

    async function saveOption(event: any, name: string) {
        props.store.set(name, { value: event.target.checked})
        props.store.save()
    }

 
    useEffect(() => {
        loadOptions()
    },[])

    return (
        <div>
            <div className='heading'>Options</div>
            <div id='optionsBackdrop'>
                { optionsLoaded && 
                 <ul id='optionsList'>
                    <li className='option'>
                        <input className='optionToggle' 
                               defaultChecked={isDark} 
                               onChange={(event) => saveOption(event, 'option-darkmode')} 
                               type="checkbox" 
                               name="darkmode" />
                        <p className='optionName'>Dark mode (available soon)</p>  
                    </li>
                    <li className='option'>
                        <input className='optionToggle' 
                               defaultChecked={isLocallySaved} 
                               onChange={(event) => saveOption(event, 'option-localsave')} 
                               type="checkbox" 
                               name="localsave" />
                        <p className='optionName'>Save markers locally while online</p>
                    </li>
                 </ul>
                }
            </div>
        </div>
    )
}

export default Options