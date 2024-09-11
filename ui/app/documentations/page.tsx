"use client";

import { Button } from "@nextui-org/button";
import Table from "./components/table";
import H2 from "@/components/h2";
import Form from "./components/form";
import { useState } from "react";
import { Modal } from "antd";

export default function Page() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDocumentation, setActiveDocumentation] = useState<null | string>(null);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setActiveDocumentation(null);
    };

    const handleAddClick = () => {
        console.log('Add documentation');
        setActiveDocumentation(null);
        showModal();
    }

    const handleEditDocumentationClick = (id: string) => {
        console.log('Edit documentation', id);
        setActiveDocumentation(id);
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

            <Table onRowEdit={handleEditDocumentationClick} />

            <Modal open={isModalOpen} footer={null} onCancel={handleCancel}>
                <Form docId={activeDocumentation} postSubmit={() => setIsModalOpen(false)} />
            </Modal>

        </>
    );

}