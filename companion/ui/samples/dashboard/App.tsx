import { useEffect, useRef } from 'react';
import './App.css';


export const AcmeLogo = () => {
    return (
        <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
            <path
                clipRule="evenodd"
                d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
                fill="currentColor"
                fillRule="evenodd"
            />
        </svg>
    );
};

export default function App() {
    const div = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            const newDiv = document.createElement('div');
            newDiv.innerHTML = 'Hello there';
            newDiv.classList.add('w-full', 'h-10', 'text-center', 'border-2', 'border-red-500');
            newDiv.style.marginTop = '1000px';
            newDiv.style.marginBottom = '50px';
            div.current?.appendChild(newDiv);
        }, 2000);

        return () => {
            // remove all children
            // @ts-expect-error Not null
            div.current.innerHTML = '';
        }
    }, []);


    return (
        <div className="container mx-auto" style={{ maxWidth: '960px', margin: '0 auto' }}>
            <nav className="flex items-center justify-between py-4">
                <div className="flex items-center">
                    <AcmeLogo />
                    <p className="font-bold text-inherit">ACME</p>
                </div>
                <div className="flex gap-4" >
                    <div>
                        <a color="foreground" href="#">
                            Features
                        </a>
                    </div>
                    <div>
                        <a aria-current="page" href="#">
                            Customers
                        </a>
                    </div>
                    <div>
                        <a color="foreground" href="#">
                            Integrations
                        </a>
                    </div>
                </div >
                <div className="flex gap-4">
                    <div className="flex">
                        <a href="#">Login</a>
                    </div>
                    <div>
                        <a color="primary" href="#">
                            Sign Up
                        </a>
                    </div>
                </div >
            </nav >

            <table aria-label="Example static collection table" className='mt-10'>
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>ROLE</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr key="1">
                        <td>Tony Reichert</td>
                        <td>CEO</td>
                        <td>Active</td>
                    </tr>
                    <tr key="2">
                        <td>Zoey Lang</td>
                        <td>Technical Lead</td>
                        <td>Paused</td>
                    </tr>
                    <tr key="3">
                        <td>Jane Fisher</td>
                        <td>Senior Developer</td>
                        <td>Active</td>
                    </tr>
                    <tr key="4">
                        <td>William Howard</td>
                        <td>Community Manager</td>
                        <td>Vacation</td>
                    </tr>
                </tbody>
            </table>

            <div ref={div}>

            </div>
        </div >

    );
}