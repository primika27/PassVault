import { Link } from 'react-router-dom';

export function Navbar() {
     return (
       <nav>
         <Link to="/">Home</Link>
         <Link to="/vault">Vault</Link>
         <Link to="/generator">Generator</Link>
        <Link to="/evaluator">Evaluator</Link>
       </nav>
     );
   }