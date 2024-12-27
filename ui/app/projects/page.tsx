"use client";

import Table from "./components/table";
import H2 from "@/components/H2";
import Form from "./components/Form";
import { useState } from "react";
import { Modal } from "antd";
import PrimaryBtn from "@/components/ButtonPrimary";
import RightArrowIcon from "@/components/icons/right_arrow";


export default function ProjectList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<null | string>(null);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    const handleAddClick = () => {
        console.log('Add project');
        setSelectedProject(null);
        showModal();
    }

    const handleEditClick = (id: string) => {
        console.log('Edit project', id);
        setSelectedProject(id);
        showModal();
    };


    return (
        <>
            <div className="flex justify-between items-center pb-2">
                <H2>Projects</H2>

                <div className="inline-flex space-x-1">
                    <PrimaryBtn text="Add project"
                        icon={<RightArrowIcon />}
                        onClick={handleAddClick} />
                </div>
            </div>

            <Table onRowEdit={handleEditClick} />

            <Modal open={isModalOpen} footer={null} onCancel={handleCancel}>
                <Form projectId={selectedProject} postSubmit={() => setIsModalOpen(false)} />
            </Modal>
        </>
    );

}