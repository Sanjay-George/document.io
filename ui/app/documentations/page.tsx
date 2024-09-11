"use client";

import { Button } from "@nextui-org/button";
import Table from "./components/table";
import H2 from "@/components/h2";
import Form from "./components/form";
import { useState } from "react";
import { Modal } from "antd";
import { useProjects } from "@/data/projects/useSWR";

export default function Page() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeProject, setActiveProject] = useState<null | string>(null);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setActiveProject(null);
    };

    const handleAddClick = () => {
        console.log('Add project');
        setActiveProject(null);
        showModal();
    }

    const handleEditProjectClick = (id: string) => {
        console.log('Edit project', id);
        setActiveProject(id);
        showModal();
    };

    return (
        <>
            <div className="flex justify-between items-center pb-5">
                <H2>Documentations</H2>
                <Button className="bg-emerald-700 text-white" variant="solid" radius="sm" size="md" onClick={handleAddClick}>
                    Add a documentation
                    <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </Button>
            </div>

            <Table onRowEdit={handleEditProjectClick} />

            <Modal open={isModalOpen} footer={null} onCancel={handleCancel}>
                <Form projectId={activeProject} postSubmit={() => setIsModalOpen(false)} />
            </Modal>

        </>
    );

}