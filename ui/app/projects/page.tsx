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
        <H2>Projects</H2>
        <Table />
        </>
    );

}