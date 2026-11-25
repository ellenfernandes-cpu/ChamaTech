from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    papel = Column(String(20), default="cliente", nullable=False)
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chamados = relationship("Chamado", back_populates="autor")
    comentarios = relationship("Comentario", back_populates="autor")


class Chamado(Base):
    __tablename__ = "chamados"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=False)
    prioridade = Column(String(20), default="media", nullable=False)
    status = Column(String(20), default="aberto", nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    autor = relationship("Usuario", back_populates="chamados")
    comentarios = relationship("Comentario", back_populates="chamado", cascade="all, delete-orphan")


class Comentario(Base):
    __tablename__ = "comentarios"

    id = Column(Integer, primary_key=True, index=True)
    conteudo = Column(Text, nullable=False)
    chamado_id = Column(Integer, ForeignKey("chamados.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chamado = relationship("Chamado", back_populates="comentarios")
    autor = relationship("Usuario", back_populates="comentarios")


class ArtigoFAQ(Base):
    __tablename__ = "artigos_faq"

    id = Column(Integer, primary_key=True, index=True)
    pergunta = Column(String(255), nullable=False)
    resposta = Column(Text, nullable=False)
    categoria = Column(String(100), default="Geral")
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))