"use client";

import Table from "./components/Table";
import H2 from "@/components/H2";
import Form from "./components/Form";
import { useState } from "react";
import { Modal } from "antd";
import PrimaryBtn from "@/components/ButtonPrimary";
import RightArrowIcon from "@/components/icons/right_arrow";


export default function ProjectList() {
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

    const handleEditClick = (id: string) => {
        console.log('Edit documentation', id);
        setActiveDocumentation(id);
        showModal();
    };


    return (
        <>
            <div className="flex justify-between items-center pb-5">
                <H2>Projects</H2>

                <div className="inline-flex space-x-1">
                    <PrimaryBtn text="Add project"
                        icon={<RightArrowIcon />}
                        onClick={handleAddClick} />
                </div>
            </div>

            <Table onRowEdit={handleEditClick} />

            <Modal open={isModalOpen} footer={null} onCancel={handleCancel}>
                <Form docId={activeDocumentation} postSubmit={() => setIsModalOpen(false)} />
            </Modal>
        </>
    );

}