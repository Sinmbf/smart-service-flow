import {BrowserRouter, Routes, Route} from "react-router-dom";

function AppRoutes(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePlaceholder />} />
            </Routes>
        </BrowserRouter>
    )
}

function HomePlaceholder(){
    return (<>Application is working</>)
}

export default AppRoutes;