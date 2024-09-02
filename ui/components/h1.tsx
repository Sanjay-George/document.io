export default function H1({ children }: { children: React.ReactNode }) {
    return (
        <h1 className="my-4 mb-8 text-4xl font-extrabold leading-none tracking-tight
             text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            {children}
        </h1>
    );
}