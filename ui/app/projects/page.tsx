import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import Table from "./components/table";
import H2 from "@/components/h2";

export default function Page() {
    // Add a card for each project. Full width of container. 
    // Left side a randomly generated image. Right side the project title and description.
    return (
        <>
            {/* Add a flexbox. H2 on left, new button on right */}
            <div className="flex justify-between items-center">
                <H2>Projects</H2>
                <Button  className="bg-emerald-700 text-white" variant="solid" radius="sm" size="md">
                    Add a project
                    <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </Button>
            </div>
            <Table />
        </>
    );

}