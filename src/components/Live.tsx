import React from 'react'

interface LiveProps {
    id: string,
}

class Live extends React.Component<LiveProps> {
    render() {
        return (
            <div className="liveDiv">
                <h1 className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-center">
                    Offline
                </h1>
            </div>
        )
    }
}

export default Live