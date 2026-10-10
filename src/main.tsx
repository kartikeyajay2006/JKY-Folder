import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){if(this.state.failed)return <main className="boot"><h1>Let’s reopen your workspace.</h1><p>Something interrupted this view. Your saved packet remains on the server.</p><button className="primary" onClick={()=>location.reload()}>Reload workspace</button></main>;return this.props.children;}}
createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>);
