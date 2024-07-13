<?php

namespace App\Entity;

use App\Config\DomainRole;
use App\Repository\DomainEntityRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DomainEntityRepository::class)]
class DomainEntity
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Domain::class, cascade: ['persist'], inversedBy: 'domainEntities')]
    #[ORM\JoinColumn(referencedColumnName: 'ldh_name', nullable: false)]
    private ?Domain $domain = null;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Entity::class, cascade: ['persist'], inversedBy: 'domainEntities')]
    #[ORM\JoinColumn(referencedColumnName: 'id', nullable: false)]
    private ?Entity $entity = null;

    #[ORM\Column(type: Types::SIMPLE_ARRAY, enumType: DomainRole::class)]
    private array $roles = [];


    public function getDomain(): ?Domain
    {
        return $this->domain;
    }

    public function setDomain(?Domain $domain): static
    {
        $this->domain = $domain;

        return $this;
    }

    public function getEntity(): ?Entity
    {
        return $this->entity;
    }

    public function setEntity(?Entity $entity): static
    {
        $this->entity = $entity;

        return $this;
    }

    /**
     * @return DomainRole[]
     */
    public function getRoles(): array
    {
        return $this->roles;
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

}
