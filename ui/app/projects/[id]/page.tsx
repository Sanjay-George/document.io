"use client";

import { Library, Search, Video } from 'lucide-react';
import H2 from "@/components/H2";
import PrimaryBtn from "@/components/ButtonPrimary";
import Form from "./components/Form";
import { useProject } from "@/data_access/swr/projects";
import Spinner from "@/components/icons/spinner";
import RightArrowIcon from "@/components/icons/right_arrow";
import { use, useState } from "react";
import { useDocumentations } from "@/data_access/swr/documentations";
import { Tooltip } from "@heroui/tooltip"
import ImportForm from "./components/ImportForm";
import ImportIcon from "@/components/icons/import_icon";
import List from "./components/List";
import { Button } from "@heroui/button";
import ButtonAccent from '@/components/ButtonAccent';
import ButtonSecondary from '@/components/ButtonSecondary';
import ButtonPrimary from '@/components/ButtonPrimary';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@heroui/modal";
import AISearch from './components/AISearch';


export default function ProjectDetails({ params }: { params: { id: string } }) {
    const projectId = use(params)?.id;
    const { data: projectData, isLoading: isProjectLoading } = useProject(projectId as any);
    const { data: documentations, isLoading: isDocumentationLoading } = useDocumentations(projectId as any);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [selectedDocumentation, setSelectedDocumentation] = useState<null | string>(null);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedDocumentation(null);
    };
    const handleAddClick = () => {
        console.log('Add documentation');
        setSelectedDocumentation(null);
        showModal();
    };
    const handleEditClick = (id: string) => {
        console.log('Edit documentation', id);
        setSelectedDocumentation(id);
        showModal();
    };

    const handleImportModalCancel = () => {
        setImportModalOpen(false);
    }
    const handleImportClick = () => {
        setImportModalOpen(true);
    }


    if (isProjectLoading || isDocumentationLoading) {
        return <Spinner />;
    }
    return (
        <>
            <div className="flex justify-between">
                <div>
                    <H2>{projectData?.title}</H2>
                </div>
                <div className="inline-flex space-x-1 items-center">
                    <Tooltip content="Import data" placement="left" offset={-10}>
                        <button className=" text-slate-400 px-3 py-2 hover:text-slate-700"
                            onClick={handleImportClick}>
                            <ImportIcon />
                        </button>
                    </Tooltip>

                    <ButtonSecondary text="Upload Media" icon={<Video size={18} />}
                        href={`/projects/${projectId}/upload`}
                    />

                    <ButtonPrimary text="Add documentation"
                        icon={<Library size={18} />}
                        onClick={handleAddClick} />

                </div>

            </div>

            <div>
                <p className="mb-4 pb-2 text-slate-400 font-light ">{projectData?.description}</p>
            </div>

            <List projectId={projectId} onRowEdit={handleEditClick} />

            <Modal isOpen={isModalOpen} onClose={handleCancel} size="xl">
                <ModalContent>
                    <ModalBody>
                        <Form projectId={projectId}
                            documentationId={selectedDocumentation}
                            postSubmit={() => setIsModalOpen(false)} />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isImportModalOpen} onClose={handleImportModalCancel} size="xl">
                <ModalContent>
                    <ModalBody>
                        <ImportForm documentationId={projectId} postSubmit={() => setImportModalOpen(false)} />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <AISearch projectName={projectData?.title} />
        </>
    );
}